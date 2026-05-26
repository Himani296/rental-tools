const mongoose = require("mongoose");

const challanSchema = new mongoose.Schema(
{
  referenceNo: { type: String, required: true, unique: true },

  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: { type: String, required: true },

  dispatchDate: { type: Date },
  expectedReturn: { type: Date },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String, required: true },
      quantityOut: { type: Number, required: true, default: 0 },
      quantityReturned: { type: Number, default: 0 },
      price: { type: Number, default: 0 }
    }
  ],

  quantityOut: { type: Number, default: 0 },
  quantityReturned: { type: Number, default: 0 },

  depositAmount: { type: Number, default: 0 },
  depositMode: { type: String, default: "Cash" },
  depositRef: { type: String, default: "" },

  loadingAmount: { type: Number, default: 0 },
  loadingVehicle: { type: String, default: "" },

  unloadingAmount: { type: Number, default: 0 },
  unloadingVehicle: { type: String, default: "" },

  notes: { type: String, default: "" },

  status: { type: String, default: "Active" }
},
{ timestamps: true }
);

module.exports = mongoose.model("Challan", challanSchema);