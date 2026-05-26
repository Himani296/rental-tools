const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  customerName: { type: String, required: true }, // small c
  contactName: String,
  phone: String,
  email: String,
  billingAddress: String,
  shippingAddress: String,
  gstNumber: String,
  aadhaarNumber: String,
  panNumber: String,
  status: { type: String, default: "Active" },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
