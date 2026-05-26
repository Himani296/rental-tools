const express = require("express");
const router = express.Router();

const { recordReturn } = require("../controllers/returnController");

router.post("/", recordReturn);

module.exports = router; 