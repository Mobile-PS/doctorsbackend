const Email = require("email-templates");
const nodemailer = require("nodemailer");
const { emailConfig } = require("../../../config/vars");
const logger = require("../../../config/logger");

exports.sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "labhi873@gmail.com",
        pass: "9535823323",
      },
      secure: false, // upgrades later with STARTTLS -- change this based on the PORT
    });

    // verify connection configuration
    transporter.verify((error) => {
      if (error) {
        console.log("error with email connection");
      }
    });
    const mailOptions = {
      from: "labhi873@gmail.com",
      to: email,
      subject: "sending email using nodemailer",
      text: `Your otp to reset the password is ${otp}`,
    };
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        logger.info(error);
        return error;
      } else {
        logger.info(info.response);
        return info.response;
      }
    });
  } catch (error) {
    return error.message;
  }
};
