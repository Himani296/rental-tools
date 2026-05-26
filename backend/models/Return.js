const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    challanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challan"
    },
    returnDate: Date,
    items: [
      {
        productName: String,
        good: Number,
        damaged: Number,
        broken: Number,
        lost: Number,
        notes: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Return", returnSchema);