const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isAdmin } = require("../controllers/auth");
const {
  getCommissionChart,
  addNewCommissionRow,
  updateCommissionRow,
  deleteCommissionRow,
} = require("../controllers/adminCommissions");

router.get(
  "/admin-getCommissionChart",
  isSignedIn,
  isAdmin,
  getCommissionChart
);

router.post(
  "/admin-addNewCommissionRow",
  isSignedIn,
  isAdmin,
  [
    check("priceLimit").notEmpty().withMessage("Price Limit is required"),
    check("fixedCommission")
      .notEmpty()
      .withMessage("Fixed Commission is required"),
    check("percentCommission")
      .notEmpty()
      .withMessage("Percent Commission is required"),
  ],
  handleValidationError,
  addNewCommissionRow
);

router.post(
  "/admin-updateCommissionRow",
  isSignedIn,
  isAdmin,
  [
    check("rowId")
      .notEmpty()
      .withMessage("Row Id is required")
      .custom((orderId) => mongoose.isValidObjectId(orderId))
      .withMessage("Row Id is invalid"),
  ],
  handleValidationError,
  updateCommissionRow
);

router.delete(
  "/admin-deleteCommissionRow",
  isSignedIn,
  isAdmin,
  [
    check("rowId")
      .notEmpty()
      .withMessage("Row Id is required")
      .custom((orderId) => mongoose.isValidObjectId(orderId))
      .withMessage("Row Id is invalid"),
  ],
  handleValidationError,
  deleteCommissionRow
);

module.exports = router;
