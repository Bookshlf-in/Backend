const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const Multer = require("multer");

const { handleValidationError } = require("../functions/validator");
const { sendMessage } = require("../controllers/message");

router.post(
  "/sendMessage",
  Multer().any(),
  [
    check("name").isLength({ min: 1 }).withMessage("Name is required"),
    check("email").isEmail().withMessage("Email is required"),
    check("subject").isLength({ min: 1 }).withMessage("Subject is required"),
    check("message").isLength({ min: 1 }).withMessage("Message is required"),
  ],
  handleValidationError,
  sendMessage
);

module.exports = router;
