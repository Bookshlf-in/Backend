const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  verifyEmail,
  sendVerifyEmailOtp,
  resetPassword,
  sendResetPasswordOtp,
} = require("../controllers/account");

router.post(
  "/sendVerifyEmailOtp",
  [check("email").isEmail().withMessage("Email is required")],
  sendVerifyEmailOtp
);

router.post(
  "/verifyEmail",
  [
    check("otp").isLength({ min: 6 }).withMessage("OTP should be of 6 digits"),
    check("email").isEmail().withMessage("Email is required"),
  ],
  verifyEmail
);

router.post(
  "/sendResetPasswordOtp",
  [check("email").isEmail().withMessage("Email is required")],
  sendResetPasswordOtp
);

router.post(
  "/resetPassword",
  [
    check("otp").isLength({ min: 6 }).withMessage("OTP should be of 6 digits"),
    check("email").isEmail().withMessage("Email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password should be atleast 6 characters long")
      .not()
      .isIn(["123456", "password"])
      .withMessage("Do not use a common word as the password"),
  ],
  resetPassword
);

module.exports = router;
