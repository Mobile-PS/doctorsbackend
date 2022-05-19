const httpStatus = require("http-status");
const { omit } = require("lodash");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sucessResponse, failResponse } = require("../utils/responceHandler");
const { jwtSecret } = require("../../config/vars");

exports.userSignUp = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role, social_plateform } =
      req.body;
    if (social_plateform != "manual") {
      const savedemail = await User.findOne({
        email: email,
      });
      if (savedemail) {
        const userTo = {
          useremail: email,
          role: savedemail.role,
        };
        const accessToken = jwt.sign(userTo, jwtSecret);
        const dataToSend = {
          email: savedemail.email,
          name: savedemail.name,
          token: accessToken,
        };
        return sucessResponse(
          res,
          dataToSend,
          200,
          "User logged in successfully"
        );
      }
      const createdUser = await User.create({
        name: name,
        email: email,
        social_plateform: social_plateform,
        password: "",
      });
      const userTo = {
        useremail: email,
        role: createdUser.role,
      };
      const accessToken = jwt.sign(userTo, jwtSecret);
      const dataToSend = {
        email: createdUser.email,
        name: createdUser.name,
        token: accessToken,
      };
      return sucessResponse(
        res,
        dataToSend,
        200,
        "User registered successfully"
      );
    }
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
      social_plateform: social_plateform,
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
    return sucessResponse(res, dataToSend, 200, "User registered successfully");
  } catch (error) {
    return failResponse(res, null, 400, error.message);
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password, phoneNumber, social_plateform, name } = req.body;
    const user = await User.findOne({
      $or: [{ email: email }, { mobile: phoneNumber }],
    });
    if (social_plateform != "manual" && !user) {
      const createdUser = await User.create({
        name: name,
        email: email,
        social_plateform: social_plateform,
        password: "",
      });
      const userTo = {
        useremail: email,
        role: createdUser.role,
      };
      const accessToken = jwt.sign(userTo, jwtSecret);
      const dataToSend = {
        email: createdUser.email,
        name: createdUser.name,
        token: accessToken,
      };
      return sucessResponse(
        res,
        dataToSend,
        200,
        "User registered successfully"
      );
    }
    if (!user)
      return failResponse(res, null, 400, "Please check your phone or email");

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
    if (social_plateform != "manual") {
      if (social_plateform == user.social_plateform) {
        return sucessResponse(
          res,
          dataToSend,
          200,
          "User Logged in successfully"
        );
      } else {
        return failResponse(
          res,
          null,
          400,
          "Invalid social plateform selected"
        );
      }
    }
    if (!password.trim()) {
      return failResponse(res, null, 400, "please check the password");
    }
    console.log(password);
    const validPass = await bcrypt.compare(password, user.password);
    console.log(validPass);
    if (!validPass) {
      return failResponse(res, null, 400, "please check the password");
    }

    return sucessResponse(res, dataToSend, 200, "User Logged in successfully");
  } catch (error) {
    return failResponse(res, null, 400, error.message);
  }
};
