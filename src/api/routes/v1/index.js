const express = require("express");
const userRoutes = require("./doctor.route");
const authRoutes = require("./auth.route");
const otp = require("./otp.route");

const router = express.Router();

/**
 * GET v1/status
 */
router.get("/status", (req, res) => res.send("OK"));

/**
 * GET v1/docs
 */
router.use("/docs", express.static("docs"));

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/otp", otp);

module.exports = router;
