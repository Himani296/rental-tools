const Challan = require("../models/Challan");

// GET all challans
exports.getChallans = async (req, res) => {
  try {
    const challans = await Challan.find().sort({ createdAt: -1 });
    res.json(challans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE challan
exports.createChallan = async (req, res) => {
  try {
    const newChallan = new Challan(req.body);
    const saved = await newChallan.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE challan
exports.updateChallan = async (req, res) => {
  try {
    const updated = await Challan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE challan
exports.deleteChallan = async (req, res) => {
  try {
    await Challan.findByIdAndDelete(req.params.id);
    res.json({ message: "Challan deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};