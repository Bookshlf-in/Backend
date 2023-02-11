const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  isSignedIn,
  isAdmin,
  checkAdminPermission,
} = require("../controllers/auth");
const {
  getWithdrawRequests,
  getWithdrawRequest,
  cancelWithdrawRequest,
  withdrawRequestMarkComplete,
  getSellerTransactionList,
} = require("../controllers/adminWallet");

router.get(
  "/admin-getWithdrawRequests",
  isSignedIn,
  isAdmin,
  checkAdminPermission("WALLET"),
  getWithdrawRequests
);

router.get(
  "/admin-getWithdrawRequest",
  isSignedIn,
  isAdmin,
  checkAdminPermission("WALLET"),
  [
    check("requestId")
      .notEmpty()
      .withMessage("requestId is required")
      .custom((orderId) => mongoose.isValidObjectId(orderId))
      .withMessage("requestId is invalid"),
  ],
  handleValidationError,
  getWithdrawRequest
);

router.post(
  "/admin-cancelWithdrawRequest",
  isSignedIn,
  isAdmin,
  checkAdminPermission("WALLET"),
  [
    check("requestId")
      .notEmpty()
      .withMessage("requestId is required")
      .custom((orderId) => mongoose.isValidObjectId(orderId))
      .withMessage("requestId is invalid"),
  ],
  handleValidationError,
  cancelWithdrawRequest
);

router.post(
  "/admin-withdrawRequestMarkComplete",
  isSignedIn,
  isAdmin,
  checkAdminPermission("WALLET"),
  [
    check("requestId")
      .notEmpty()
      .withMessage("requestId is required")
      .custom((orderId) => mongoose.isValidObjectId(orderId))
      .withMessage("requestId is invalid"),
    check("txnNumber").notEmpty().withMessage("Transaction number is required"),
  ],
  handleValidationError,
  withdrawRequestMarkComplete
);

router.get(
  "/admin-getSellerTransactionList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("WALLET"),
  [
    check("sellerId")
      .notEmpty()
      .withMessage("Seller Id is required")
      .custom((orderId) => mongoose.isValidObjectId(orderId))
      .withMessage("sellerId is invalid"),
  ],
  handleValidationError,
  getSellerTransactionList
);

module.exports = router;
