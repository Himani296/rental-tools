const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Challan = require("../models/Challan");

exports.getDashboardStats = async (req, res) => {
  console.log("Dashboard API Hit ✅");

  try {
    const products = await Product.countDocuments();
    const customers = await Customer.countDocuments();
    const invoices = await Invoice.countDocuments();
    const challans = await Challan.countDocuments();

    const activeChallans = await Challan.find()
      .sort({ createdAt: -1 })
      .lean();

    const pendingReturns = activeChallans
      .map((challan) => {
        const qtyOut = Number(challan.quantityOut || 0);
        const qtyReturned = Number(challan.quantityReturned || 0);
        const pendingQty = Math.max(qtyOut - qtyReturned, 0);
        if (pendingQty <= 0) return null;

        const perDayRevenue = (challan.items || []).reduce((sum, item) => {
          const out = Number(item.quantityOut || 0);
          const returned = Number(item.quantityReturned || 0);
          const pending = Math.max(out - returned, 0);
          const rate = Number(item.price || 0);
          return sum + pending * rate;
        }, 0);

        return {
          challanId: challan._id,
          referenceNo: challan.referenceNo,
          customerName: challan.customerName,
          createdAt: challan.createdAt,
          expectedReturn: challan.expectedReturn || null,
          qtyPending: pendingQty,
          perDayRevenue,
          isOverdue:
            Boolean(challan.expectedReturn) &&
            new Date(challan.expectedReturn).getTime() < Date.now(),
        };
      })
      .filter(Boolean)
      .slice(0, 10);

    const pendingReturnRevenue = pendingReturns.reduce(
      (sum, row) => sum + Number(row.perDayRevenue || 0),
      0,
    );

    const allInvoices = await Invoice.find()
      .populate("customer", "customerName")
      .sort({ createdAt: -1 })
      .lean();

    const invoicesAwaitingCollection = allInvoices
      .filter((invoice) => String(invoice.status || "Draft") !== "Paid")
      .map((invoice) => ({
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber || `INV-${String(invoice._id).slice(-6).toUpperCase()}`,
        customerName:
          invoice.customerName || invoice.customer?.customerName || "Unknown customer",
        issueDate: invoice.issueDate || invoice.createdAt,
        status: invoice.status || "Draft",
        totalAmount: Number(invoice.finalAmount || invoice.subtotal || 0),
        pendingAmount: Number(invoice.finalAmount || invoice.subtotal || 0),
      }))
      .slice(0, 10);

    const pendingInvoiceAmount = invoicesAwaitingCollection.reduce(
      (sum, row) => sum + Number(row.pendingAmount || 0),
      0,
    );

    res.json({
      products,
      customers,
      invoices,
      challans,
      pendingReturns,
      pendingReturnRevenue,
      invoicesAwaitingCollection,
      pendingInvoiceAmount,
    });

  } catch (error) {
    console.log("Error in dashboard controller:", error);
    res.status(500).json({ message: error.message });
  }
};