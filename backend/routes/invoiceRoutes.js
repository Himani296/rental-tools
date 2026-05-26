const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");

router.get("/", invoiceController.getInvoices);

router.get("/eligible-challans", invoiceController.getEligibleChallans);

router.post("/create", invoiceController.createInvoice);
router.put("/:id", invoiceController.updateInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

module.exports = router;