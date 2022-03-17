const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isAdmin } = require("../controllers/auth");

const { sendEmail } = require("../controllers/adminEmail");

router.post(
  "/admin-sendEmail",
  isSignedIn,
  isAdmin,
  [
    check("type").notEmpty().withMessage("type is required"),
    check("emailData").notEmpty().withMessage("email data is required"),
  ],
  handleValidationError,
  sendEmail
);

module.exports = router;
