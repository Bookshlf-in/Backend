const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isAdmin } = require("../controllers/auth");
const {
  getSellerList,
  getSellerProfile,
  getSellerBookList,
  getSellerAddressList,
  markSellerAsVerified,
  markSellerAsUnverified,
} = require("../controllers/adminSeller");

const checkSellerId = [
  check("sellerId")
    .notEmpty()
    .withMessage("Seller Id is required")
    .custom((sellerId) => mongoose.isValidObjectId(sellerId))
    .withMessage("Invalid Seller Id"),
];

router.get("/admin-getSellerList", isSignedIn, isAdmin, getSellerList);

router.get("/admin-getSellerProfile", isSignedIn, isAdmin, getSellerProfile);

router.get(
  "/admin-getSellerBookList",
  isSignedIn,
  isAdmin,
  checkSellerId,
  handleValidationError,
  getSellerBookList
);

router.get(
  "/admin-getSellerAddressList",
  isSignedIn,
  isAdmin,
  checkSellerId,
  handleValidationError,
  getSellerAddressList
);

router.post(
  "/admin-markSellerAsVerified",
  isSignedIn,
  isAdmin,
  checkSellerId,
  handleValidationError,
  markSellerAsVerified
);

router.post(
  "/admin-markSellerAsUnverified",
  isSignedIn,
  isAdmin,
  checkSellerId,
  handleValidationError,
  markSellerAsUnverified
);

module.exports = router;
