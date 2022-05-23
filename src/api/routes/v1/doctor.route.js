const express = require("express");
const validate = require("express-validation");
const controller = require("../../controllers/doctor.controller");
const { authorize, ADMIN, LOGGED_USER } = require("../../middlewares/auth");

const router = express.Router();

router.post("/register", controller.userSignUp);

router.post("/login", controller.userLogin);

router.post("/send-mail", controller.passwordChangeEmail);

router.post("/verify-otp", controller.verifyOtp);

module.exports = router;
