const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer.js");

// GET all customers
router.get("/", async (req, res) => {
  try {
    console.log("GET route hit");

    const customers = await Customer.find();
    console.log("Customers found:", customers);
    res.json(customers);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST new customer
router.post("/", async (req, res) => {
  try {
    console.log("Incoming Data:", req.body);

    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();

    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST bulk customers
router.post("/bulk", async (req, res) => {
  try {
    const customers = req.body;
    if (!Array.isArray(customers) || !customers.length) {
      return res.status(400).json({ message: "No customer data provided." });
    }

    const insertedCustomers = await Customer.insertMany(customers, {
      ordered: false,
    });

    res.status(201).json({ message: "Customers imported successfully.", insertedCustomers });
  } catch (error) {
    console.error("BULK IMPORT ERROR:", error);
    res.status(500).json({ message: error.message || "Bulk import failed." });
  }
});

// DELETE customer
router.delete("/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
