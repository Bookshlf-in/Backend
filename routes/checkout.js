const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { checkoutCart, checkoutBook } = require("../controllers/checkout");
const { isSignedIn } = require("../controllers/auth");
const { handleValidationError } = require("../functions/validator");

router.get("/checkoutCart", isSignedIn, checkoutCart);

router.get(
  "/checkoutBook",
  isSignedIn,
  [check("bookId").notEmpty().withMessage("Book id required")],
  handleValidationError,
  checkoutBook
);

module.exports = router;
