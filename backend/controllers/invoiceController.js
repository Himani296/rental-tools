const Challan = require("../models/Challan");
const Return = require("../models/Return");
const Invoice = require("../models/Invoice");

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const count = await Invoice.countDocuments({
    invoiceNumber: { $regex: `^${prefix}` },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

const buildItemSignature = (items) =>
  (items || [])
    .map((item) => {
      const challanId = String(item.challanId || "");
      const productId = String(item.productId || "");
      const qty = toNumber(item.qty, 0);
      const days = toNumber(item.days, 1);
      return `${challanId}|${productId}|${qty}|${days}`;
    })
    .sort()
    .join("::");

const toInvoiceResponse = (invoice) => ({
  ...invoice,
  number: invoice.invoiceNumber,
  customerName:
    invoice.customerName || invoice.customer?.customerName || "Unknown customer",
  challanRef: Array.isArray(invoice.challanRefs)
    ? invoice.challanRefs.join(", ")
    : "",
  totalAmount: toNumber(invoice.finalAmount || invoice.subtotal, 0),
});

/* Get all invoices */
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer", "customerName email")
      .lean()
      .sort({ createdAt: -1 });
    
    console.log(`[GET /invoices] Found ${invoices.length} invoices`);
    invoices.forEach((inv, idx) => {
      console.log(`  [${idx}] ID: ${inv._id}, Number: ${inv.invoiceNumber}, Customer: ${inv.customerName}`);
    });
    
    res.json(invoices.map(toInvoiceResponse));
  } catch (err) {
    console.error("[GET /invoices] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* Get challans with returns */
exports.getEligibleChallans = async (req, res) => {

  console.log("Eligible challans API hit");

  try {

    let filter = {};
    if (req.query.customerName) {
      filter.customerName = req.query.customerName;
    }

    const challans = await Challan.find(filter).lean();

    const returns = await Return.find();

    const rows = [];
    challans.forEach((challan) => {
      (challan.items || []).forEach((item) => {
        const quantityOut = toNumber(item.quantityOut, 0);
        const quantityReturned = toNumber(item.quantityReturned, 0);
        const outstandingQty = Math.max(quantityOut - quantityReturned, 0);
        if (outstandingQty <= 0) return;

        rows.push({
          challanId: challan._id,
          challanRef: challan.referenceNo,
          customer: challan.customerName,
          customerId: challan.customer || null,
          itemId: item._id,
          productId: item.product,
          productName: item.productName,
          quantityOut,
          quantityReturned,
          outstandingQty,
          chargePerDay: toNumber(item.price, 0),
        });
      });
    });

    res.json({
      challans,
      returns,
      rows,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

};


/* Create Invoice */

exports.createInvoice = async (req, res) => {

  try {
    console.log("[POST /invoices/create] Received request");

    const payloadItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (!payloadItems.length) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    const challanIds = [...new Set(payloadItems.map((item) => String(item.challanId)))];
    const challans = await Challan.find({ _id: { $in: challanIds } }).lean();
    const challanMap = new Map(challans.map((challan) => [String(challan._id), challan]));

    const firstChallan = challanMap.get(String(payloadItems[0].challanId));
    if (!firstChallan) {
      return res.status(400).json({ message: "Invalid challan selection" });
    }

    const invoiceItems = payloadItems.map((row) => {
      const challan = challanMap.get(String(row.challanId));
      const challanItem = (challan?.items || []).find(
        (item) => String(item._id) === String(row.itemId),
      );

      const qty = toNumber(row.qty ?? row.outstandingQty ?? row.quantityOut, 0);
      const chargePerDay = toNumber(row.chargePerDay ?? challanItem?.price, 0);
      const days = Math.max(toNumber(row.days, 1), 1);
      const amount = qty * chargePerDay * days;
      const gstRate = toNumber(row.gstRate, 0);
      const gstAmount = (amount * gstRate) / 100;

      return {
        challanId: row.challanId,
        productId: row.productId || challanItem?.product,
        qty,
        chargePerDay,
        days,
        amount,
        discountType: row.discountType || "none",
        discountValue: toNumber(row.discountValue, 0),
        gstRate,
        gstAmount,
      };
    });

    const subtotal = invoiceItems.reduce((sum, item) => sum + toNumber(item.amount, 0), 0);
    const gstTotal = invoiceItems.reduce((sum, item) => sum + toNumber(item.gstAmount, 0), 0);
    const otherCharges = toNumber(req.body.otherCharges, 0);
    const loadingCharges = toNumber(req.body.loadingCharges, 0);
    const unloadingCharges = toNumber(req.body.unloadingCharges, 0);
    const discountTotal = toNumber(req.body.discountTotal, 0);
    const depositApplied = toNumber(req.body.depositApplied, 0);
    const finalAmount =
      subtotal + gstTotal + otherCharges + loadingCharges + unloadingCharges - discountTotal - depositApplied;

    const issueDateValue = req.body.issueDate ? new Date(req.body.issueDate) : new Date();
    const startOfDay = new Date(issueDateValue);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(issueDateValue);
    endOfDay.setHours(23, 59, 59, 999);

    const candidateSignature = buildItemSignature(invoiceItems);
    console.log(`[POST /invoices/create] Signature: ${candidateSignature}`);
    
    const sameDayInvoices = await Invoice.find({
      customer: firstChallan.customer || null,
      issueDate: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    console.log(`[POST /invoices/create] Found ${sameDayInvoices.length} same-day invoices for duplicate check`);

    const duplicate = sameDayInvoices.find(
      (existing) => buildItemSignature(existing.items) === candidateSignature,
    );

    if (duplicate) {
      console.log(`[POST /invoices/create] DUPLICATE DETECTED! ID: ${duplicate._id}, Number: ${duplicate.invoiceNumber}`);
      return res.status(409).json({
        message: "Duplicate invoice prevented: same customer and same items already invoiced.",
        invoiceId: duplicate._id,
      });
    }

    const invoice = new Invoice({
      invoiceNumber: await buildInvoiceNumber(),
      customer: firstChallan.customer || null,
      customerName: firstChallan.customerName,
      challanRefs: [...new Set(payloadItems.map((item) => item.challanRef).filter(Boolean))],
      issueDate: issueDateValue,
      dueDate: req.body.dueDate || null,
      status: req.body.status || "Draft",
      items: invoiceItems,
      subtotal,
      discountTotal,
      gstTotal,
      otherCharges,
      loadingCharges,
      unloadingCharges,
      depositApplied,
      finalAmount,
      remarks: req.body.remarks || "",
      internalNotes: req.body.internalNotes || "",
    });

    await invoice.save();
    console.log(`[POST /invoices/create] ✓ Invoice created: ID=${invoice._id}, Number=${invoice.invoiceNumber}`);

    const populated = await Invoice.findById(invoice._id)
      .populate("customer", "customerName email")
      .lean();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: toInvoiceResponse(populated),
    });

  } catch (err) {

    console.error("[POST /invoices/create] Error:", err.message);

    res.status(500).json({
      message: err.message
    });

  }

};

exports.updateInvoice = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.finalAmount !== undefined) {
      updates.finalAmount = toNumber(updates.finalAmount, 0);
    }

    const updated = await Invoice.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "customerName email")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(toInvoiceResponse(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};