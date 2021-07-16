const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn } = require("../controllers/auth");
const {
  getCartList,
  addCartItem,
  deleteCartItem,
  changeCartItemPurchaseQty,
  countCartItems,
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

router.post(
  "/changeCartItemPurchaseQty",
  isSignedIn,
  [
    check("cartItemId").notEmpty().withMessage("Card Item Id is required"),
    check("purchaseQty")
      .notEmpty()
      .withMessage("New quantity is required")
      .isInt({ min: 1 })
      .withMessage("Only positive numeric value acceptable"),
  ],
  handleValidationError,
  changeCartItemPurchaseQty
);

router.get("/countCartItems", isSignedIn, countCartItems);

module.exports = router;
