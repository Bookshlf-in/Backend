const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn } = require("../controllers/auth");
const {
  getCartList,
  addCartItem,
  deleteCartItem,
} = require("../controllers/cart");

router.get("/getCartList", isSignedIn, getCartList);

router.post(
  "/addCartItem",
  isSignedIn,
  [check("bookId").notEmpty().withMessage("Book Id is required")],
  handleValidationError,
  addCartItem
);

router.delete(
  "/deleteCartItem",
  isSignedIn,
  [check("bookId").notEmpty().withMessage("Book Id is required")],
  handleValidationError,
  deleteCartItem
);

module.exports = router;
