const Return = require("../models/Return");
const Challan = require("../models/Challan");

exports.recordReturn = async (req, res) => {
  try {
    const { challanId, returnDate, items } = req.body;

    const challan = await Challan.findById(challanId);
    if (!challan) return res.status(404).json({ message: "Challan not found" });

    for (let item of items) {
      const challanItem = challan.items.find(
        (p) => p.productName === item.productName
      );

      if (!challanItem)
        return res.status(400).json({ message: `Product "${item.productName}" not found in challan` });

      const totalReturned =
        (item.good || 0) + (item.damaged || 0) + (item.broken || 0) + (item.lost || 0);

      const outstanding =
        challanItem.quantityOut - (challanItem.quantityReturned || 0);

      if (totalReturned > outstanding)
        return res.status(400).json({
          message: `Return quantity exceeds outstanding for ${item.productName}`
        });

      if (totalReturned <= 0)
        return res.status(400).json({
          message: "At least one quantity required"
        });

      challanItem.quantityReturned = (challanItem.quantityReturned || 0) + totalReturned;
    }

    // Keep top-level total in sync
    challan.quantityReturned = challan.items.reduce(
      (sum, i) => sum + (i.quantityReturned || 0), 0
    );

    // Mark challan as returned when any return is recorded
    if (challan.quantityReturned > 0) {
      challan.status = "Returned";
    }

    await challan.save();

    const newReturn = await Return.create({
      challanId,
      returnDate,
      items
    });

    res.status(201).json(newReturn);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};