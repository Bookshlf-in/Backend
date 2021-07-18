const express = require("express");
const router = express.Router();

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
} = require("../controllers/seller");

router.post("/sellerRegister", isSignedIn, sellerRegister);

router.get("/getSellerProfile", getAuth, getSellerAuth, getSellerProfile);

router.post("/updateSellerProfile", isSignedIn, isSeller, updateSellerProfile);

module.exports = router;
