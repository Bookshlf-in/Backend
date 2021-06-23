const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  newsletterSubscribe,
  newsletterUnsubscribe,
} = require("../controllers/newsletter");

router.post(
  "/newsletterSubscribe",
  [check("email").isEmail().withMessage("Email is required")],
  handleValidationError,
  newsletterSubscribe
);

router.post(
  "/newsletterUnsubscribe",
  [check("email").isEmail().withMessage("Email is required")],
  handleValidationError,
  newsletterUnsubscribe
);

module.exports = router;
