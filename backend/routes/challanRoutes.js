const express = require("express");
const router = express.Router();
const challanController = require("../controllers/challanController");

router.get("/", challanController.getChallans);
router.post("/", challanController.createChallan);
router.put("/:id", challanController.updateChallan);
router.delete("/:id", challanController.deleteChallan);

module.exports = router;