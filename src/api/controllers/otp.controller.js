const { sucessResponse, failResponse } = require("../utils/responceHandler");
const { sendEmail } = require("../services/emails/emailProvider");

exports.generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(Math.random(4) * 10000);
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
