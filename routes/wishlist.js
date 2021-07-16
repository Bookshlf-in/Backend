const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn } = require("../controllers/auth");
const {
  getWishlist,
  addWishlistItem,
  deleteWishlistItem,
  countWishlistItems,
} = require("../controllers/wishlist");

router.get("/getWishlist", isSignedIn, getWishlist);

router.post(
  "/addWishlistItem",
  isSignedIn,
  [check("bookId").notEmpty().withMessage("Book Id is required")],
  handleValidationError,
  addWishlistItem
);

router.delete(
  "/deleteWishlistItem",
  isSignedIn,
  [check("bookId").notEmpty().withMessage("Book Id is required")],
  handleValidationError,
  deleteWishlistItem
);

router.get("/countWishlistItems", isSignedIn, countWishlistItems);

module.exports = router;
