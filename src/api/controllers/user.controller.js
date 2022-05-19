const httpStatus = require("http-status");
const { omit } = require("lodash");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sucessResponse, failResponse } = require("../utils/responceHandler");
const { jwtSecret } = require("../../config/vars");

exports.userSignUp = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;
    if (!password.trim()) {
      return failResponse(res, null, 400, "must enter a valid password");
    }
    const savedemail = await User.findOne({
      $or: [{ email: email }, { mobile: phoneNumber }],
    });
    if (savedemail) {
      return failResponse(res, null, 400, "email or phone already in use");
    }

    //hash the password using bcryptjs library

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      name: name,
      email: email,
      mobile: phoneNumber,
      password: hashPassword,
      role: role,
    });
    const userTo = {
      useremail: email,
      role: createdUser.role,
    };
    const accesToken = jwt.sign(userTo, jwtSecret);
    const dataToSend = {
      email: createdUser.email,
      name: name,
      token: accesToken,
    };
    sucessResponse(res, dataToSend, 200, "User registered successfully");
  } catch (error) {
    failResponse(res, null, 400, error.message);
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;
    const user = await User.findOne({
      $or: [{ email: email }, { mobile: phoneNumber }],
    });
    if (!user) return failResponse(res, null, 400, "email is incorrect");

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass && !phoneNumber)
      return failResponse(res, null, 400, "please check the password");

    const userTo = {
      useremail: email,
      role: user.role,
    };

    // creating the jwt token
    const accessToken = jwt.sign(userTo, jwtSecret);
    const dataToSend = {
      email: user.email,
      name: user.name,
      token: accessToken,
    };
    sucessResponse(res, dataToSend, 200, "User Logged in successfully");
  } catch (error) {
    // errorResponse(res, error);
    failResponse(res, null, 400, error.message);
  }
};
