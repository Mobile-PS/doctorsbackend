const express = require("express");
const router = express.Router();
const controller = require("../../controllers/otp.controller");

router.post("/send-otp", controller.generateOtp);

module.exports = router;
