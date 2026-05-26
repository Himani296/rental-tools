const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: String,
  description: String,
  quantity: Number,
  AvailableQty: Number,
  hsnCode: String,
  chargePerDay: Number,
  costPrice: Number,
  minDays: Number,
  displayOrder: Number,
  loadingCharges: Number,
  unloadingCharges: Number,
  depositCharges: Number,
  includeOutDate: Boolean,
  includeInDate: Boolean,
  status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
