const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { handleValidationError } = require("../functions/validator");

const { isSignedIn } = require("../controllers/auth");
const {
  verifyEmail,
  sendVerifyEmailOtp,
  resetPassword,
  sendResetPasswordOtp,
  getUserProfile,
} = require("../controllers/account");

router.post(
  "/sendVerifyEmailOtp",
  [check("email").isEmail().withMessage("Email is required")],
  handleValidationError,
  sendVerifyEmailOtp
);

router.post(
  "/verifyEmail",
  [
    check("otp").isLength({ min: 6 }).withMessage("OTP should be of 6 digits"),
    check("email").isEmail().withMessage("Email is required"),
  ],
  handleValidationError,
  verifyEmail
);

router.post(
  "/sendResetPasswordOtp",
  [check("email").isEmail().withMessage("Email is required")],
  handleValidationError,
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
  handleValidationError,
  resetPassword
);

router.get("/getUserProfile", isSignedIn, getUserProfile);

module.exports = router;
