const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

/* Middleware */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

/* Routes */
const dashboardRoutes = require("./routes/dashboardRoutes");
const customerRoutes = require("./routes/customerRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const challanRoutes = require("./routes/challanRoutes.js");
const returnRoutes = require("./routes/returnRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const invoiceRoutes = require("./routes/invoiceRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/invoices", invoiceRoutes);

/* MongoDB */
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rent-waale";

if (!process.env.MONGO_URI) {
  console.warn("Warning: MONGO_URI is not defined. Using fallback local MongoDB URI.");
}

mongoose.set("strictQuery", false);

mongoose.connect(mongoUri)
  .then(() => {
    console.log("MongoDB Connected ✅");
    app.listen(5000, () => {
      console.log("Server running on port 5000 🚀");
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });