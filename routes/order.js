const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { purchaseBook } = require("../controllers/order");
const { isSignedIn } = require("../controllers/auth");
const { handleValidationError } = require("../functions/validator");

router.post(
  "/purchaseBook",
  isSignedIn,
  [
    check("bookId").notEmpty().withMessage("Book Id is required"),
    check("customerAddressId")
      .notEmpty()
      .withMessage("Customer Address is required"),
    check("purchaseQty")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 1 })
      .withMessage("Only positive numeric value acceptable"),
  ],
  handleValidationError,
  purchaseBook
);

module.exports = router;
