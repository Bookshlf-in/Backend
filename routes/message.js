const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { getAuth } = require("../controllers/auth");
const { handleValidationError } = require("../functions/validator");
const { sendMessage } = require("../controllers/message");

router.post(
  "/sendMessage",
  [
    check("subject").isLength({ min: 1 }).withMessage("Subject is required"),
    check("message").isLength({ min: 1 }).withMessage("Message is required"),
  ],
  getAuth,
  handleValidationError,
  sendMessage
);

module.exports = router;
