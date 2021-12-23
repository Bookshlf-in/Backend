const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isSeller } = require("../controllers/auth");
const {
  getCurrentBalance,
  withdrawFromWallet,
  getWithdrawRequests,
  cancelWithdrawRequest,
  getTransactionList,
} = require("../controllers/sellerWallet");

router.get("/getCurrentBalance", isSignedIn, isSeller, getCurrentBalance);

router.post(
  "/withdrawFromWallet",
  isSignedIn,
  isSeller,
  [
    check("amount")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Amount should be integer value greater or equal to 1"),
    check("bankAccountDetails")
      .notEmpty()
      .withMessage("Bank account details is required"),
  ],
  handleValidationError,
  withdrawFromWallet
);

router.get("/getWithdrawRequests", isSignedIn, isSeller, getWithdrawRequests);

router.post(
  "/cancelWithdrawRequest",
  isSignedIn,
  isSeller,
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

router.get("/getTransactionList", isSignedIn, isSeller, getTransactionList);

module.exports = router;
