const mongoose = require("mongoose");

/**
 * User Roles
 */
const roles = ["user", "doctor"];

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      maxlength: 128,
      index: true,
      trim: true,
    },
    social_plateform: {
      type: String,
    },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
    mobile: {
      type: Number,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
