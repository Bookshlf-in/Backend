const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { check } = require("express-validator");

const { emailToLowerCase } = require("../functions/emailToLowerCase");
const { handleValidationError } = require("../functions/validator");
const {
  isSignedIn,
  isAdmin,
  checkAdminPermission,
} = require("../controllers/auth");
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

router.get(
  "/admin-getSellerList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("SELLERS"),
  getSellerList
);

router.get(
  "/admin-getSellerProfile",
  isSignedIn,
  isAdmin,
  checkAdminPermission("SELLERS"),
  emailToLowerCase,
  getSellerProfile
);

router.get(
  "/admin-getSellerBookList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("SELLERS"),
  checkSellerId,
  handleValidationError,
  getSellerBookList
);

router.get(
  "/admin-getSellerAddressList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("SELLERS"),
  checkSellerId,
  handleValidationError,
  getSellerAddressList
);

router.post(
  "/admin-markSellerAsVerified",
  isSignedIn,
  isAdmin,
  checkAdminPermission("SELLERS"),
  checkSellerId,
  handleValidationError,
  markSellerAsVerified
);

router.post(
  "/admin-markSellerAsUnverified",
  isSignedIn,
  isAdmin,
  checkAdminPermission("SELLERS"),
  checkSellerId,
  handleValidationError,
  markSellerAsUnverified
);

module.exports = router;
