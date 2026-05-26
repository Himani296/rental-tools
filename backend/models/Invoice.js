const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  challanId: { type: mongoose.Schema.Types.ObjectId, ref: "Challan" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

  qty: Number,
  chargePerDay: Number,
  days: Number,
  amount: Number,

  discountType: String,
  discountValue: Number,

  gstRate: Number,
  gstAmount: Number
});

const invoiceSchema = new mongoose.Schema({

  invoiceNumber: { type: String, trim: true },

  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: { type: String, trim: true },
  challanRefs: [{ type: String }],

  issueDate: Date,
  dueDate: Date,

  status: {
    type: String,
    enum: ["Draft", "Sent", "Paid"],
    default: "Draft"
  },

  items: [invoiceItemSchema],

  subtotal: Number,
  discountTotal: Number,
  gstTotal: Number,

  otherCharges: Number,
  loadingCharges: Number,
  unloadingCharges: Number,

  depositApplied: Number,

  finalAmount: Number,

  remarks: String,
  internalNotes: String

},{timestamps:true});

module.exports = mongoose.model("Invoice", invoiceSchema);