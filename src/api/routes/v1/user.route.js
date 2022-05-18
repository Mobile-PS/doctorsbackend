const express = require("express");
const validate = require("express-validation");
const controller = require("../../controllers/user.controller");
const { authorize, ADMIN, LOGGED_USER } = require("../../middlewares/auth");

const router = express.Router();

router.post("/register", controller.userSignUp);

router.post("/login", controller.userLogin);

module.exports = router;
