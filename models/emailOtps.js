const mongoose = require("mongoose");

const emailOtpSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  expire_at: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

module.exports = mongoose.model("EmailOtp", emailOtpSchema);
