const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  isSignedIn,
  isSeller,
  getAuth,
  getSellerAuth,
} = require("../controllers/auth");
const {
  sellerRegister,
  getSellerProfile,
  updateSellerProfile,
  getSellerReviews,
} = require("../controllers/seller");

router.post(
  "/sellerRegister",
  isSignedIn,
  [check("phoneNo").notEmpty().withMessage("Phone number is required")],
  handleValidationError,
  sellerRegister
);

router.get("/getSellerProfile", getAuth, getSellerAuth, getSellerProfile);

router.post("/updateSellerProfile", isSignedIn, isSeller, updateSellerProfile);

router.get("/getSellerReviews", getAuth, getSellerAuth, getSellerReviews);

module.exports = router;
