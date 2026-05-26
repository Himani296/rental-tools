const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/",               orderController.getOrders);
router.get("/phone/:phone",   orderController.getOrdersByPhone);
router.get("/:id",            orderController.getOrder);
router.post("/",              orderController.createOrder);
router.patch("/:id",          orderController.updateOrder);
router.delete("/:id",         orderController.deleteOrder);

module.exports = router;
