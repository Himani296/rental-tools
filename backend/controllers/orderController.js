const Order = require("../models/Order");
const Challan = require("../models/Challan");
const Customer = require("../models/Customer");

/* GET all orders – admin view */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET orders for a phone number – customer tracking */
exports.getOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const orders = await Order.find({ phone })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET single order */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("challanId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST create order from customer panel */
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();

    // Auto-create or update customer from order details
    const { customerName, phone, email, address } = req.body;
    if (customerName && phone) {
      try {
        const existing = await Customer.findOne({ phone: phone.trim() });
        if (!existing) {
          await Customer.create({
            customerName: customerName.trim(),
            phone: phone.trim(),
            email: email || "",
            billingAddress: address || "",
            shippingAddress: address || "",
            status: "Active",
          });
        } else {
          // Update name/email/address if they were blank before
          const updates = {};
          if (!existing.email && email) updates.email = email.trim();
          if (!existing.billingAddress && address) updates.billingAddress = address.trim();
          if (!existing.shippingAddress && address) updates.shippingAddress = address.trim();
          if (Object.keys(updates).length > 0) {
            await Customer.findByIdAndUpdate(existing._id, updates);
          }
        }
      } catch (custErr) {
        console.error("Auto-create customer warning:", custErr.message);
        // Don't fail the order if customer creation fails
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};

/* PATCH update order status / link challan */
exports.updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* DELETE order */
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
