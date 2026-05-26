const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId:       { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productName:     { type: String, required: true },
  quantity:        { type: Number, required: true, min: 1 },
  rentalDays:      { type: Number, required: true, min: 1 },
  chargePerDay:    { type: Number, default: 0 },
  depositCharges:  { type: Number, default: 0 },
  loadingCharges:  { type: Number, default: 0 },
  unloadingCharges:{ type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },

  // Customer details collected from the panel
  customerName: { type: String, required: true },
  phone:        { type: String, required: true },
  email:        { type: String, default: "" },
  address:      { type: String, default: "" },

  items: [orderItemSchema],

  grandTotal:      { type: Number, default: 0 },
  rentalStartDate: { type: Date },
  rentalEndDate:   { type: Date },
  notes:           { type: String, default: "" },

  // Lifecycle
  status: {
    type: String,
    enum: ["pending", "confirmed", "challan_created", "cancelled"],
    default: "pending",
  },

  // Set when admin converts this order to a challan
  challanId:  { type: mongoose.Schema.Types.ObjectId, ref: "Challan" },
  challanRef: { type: String, default: "" },
}, { timestamps: true });

// Auto-generate a short order number before first save
orderSchema.pre("validate", function () {
  if (!this.orderNumber) {
    const ts = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    this.orderNumber = `ORD-${ts}-${rand}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
