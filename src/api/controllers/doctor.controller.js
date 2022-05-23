const httpStatus = require("http-status");
const { omit } = require("lodash");
const Doctor = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sucessResponse, failResponse } = require("../utils/responceHandler");
const { jwtSecret } = require("../../config/vars");
const { sendEmail } = require("../services/emails/emailProvider");
const Otp = require("../models/passwordResetToken.model");

exports.userSignUp = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role, social_plateform } =
      req.body;
    if (social_plateform != "manual") {
      const savedemail = await Doctor.findOne({
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
      const createdUser = await Doctor.create({
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
    const savedemail = await Doctor.findOne({
      $or: [{ email: email }, { mobile: phoneNumber }],
    });
    if (savedemail) {
      return failResponse(res, null, 400, "email or phone already in use");
    }

    //hash the password using bcryptjs library
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const createdUser = await Doctor.create({
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
    let user;
    if (phoneNumber) {
      user = await Doctor.findOne({
        mobile: phoneNumber,
      });
    } else {
      user = await Doctor.findOne({
        email: email,
      });
    }

    if (social_plateform != "manual" && !user) {
      const createdUser = await Doctor.create({
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
          "Email already exist with different account"
        );
      }
    }
    if (!password.trim() && !phoneNumber) {
      return failResponse(res, null, 400, "please check the password");
    }
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass && !phoneNumber) {
      return failResponse(res, null, 400, "please check the password");
    }

    return sucessResponse(res, dataToSend, 200, "User Logged in successfully");
  } catch (error) {
    return failResponse(res, null, 400, error.message);
  }
};

/*****************
FORGOT PASSWORD
******************/

exports.passwordChangeEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Doctor.findOne({ email });
    if (!user) {
      return failResponse(
        res,
        null,
        400,
        "User not found please try with correct email"
      );
    }
    const otp = Math.floor(Math.random(4) * 10000);
    let currentTime = new Date();
    var expiryTime = new Date(currentTime.getTime() + 30 * 60000);

    const otpDocument = await Otp.create({
      otp,
      email,
      expiresAt: expiryTime,
    });
    const result = await sendEmail(email, otp);
    return sucessResponse(
      res,
      result,
      200,
      "Kindly check your email for the otp"
    );
  } catch (error) {
    return failResponse(res, null, 400, error.message);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp, email, password } = req.body;

    let currentTime = new Date().getTime();
    const savedOtp = await Otp.findOne({
      otp,
      email,
    });
    console.log(savedOtp);
    if (!savedOtp) {
      return failResponse(
        res,
        null,
        400,
        "Could not verify otp please try again"
      );
    }
    if (savedOtp.expiresAt < currentTime) {
      return failResponse(res, null, 400, "Otp timeout");
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const updatedUser = await Doctor.findOneAndUpdate(
      { email: email },
      {
        password: hashPassword,
      }
    );
    const dataToSend = {
      email: updatedUser.email,
      name: updatedUser.name,
    };
    const deletedOtp = await Otp.findOneAndDelete({ otp, email });
    return sucessResponse(res, dataToSend, 200, "Password updated sucessfully");
  } catch (error) {
    return failResponse(res, null, 400, error.message);
  }
};
