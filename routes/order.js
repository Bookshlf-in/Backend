const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  purchaseBook,
  purchaseCart,
  cancelOrder,
  getOrderList,
  getOrderDetails,
} = require("../controllers/order");
const { isSignedIn } = require("../controllers/auth");
const { handleValidationError } = require("../functions/validator");

router.get("/getOrderList", isSignedIn, getOrderList);

router.get(
  "/getOrderDetails",
  isSignedIn,
  [check("orderId").notEmpty().withMessage("Order Id is required")],
  handleValidationError,
  getOrderDetails
);

router.post(
  "/purchaseBook",
  isSignedIn,
  [
    check("bookId").notEmpty().withMessage("Book Id is required"),
    check("customerAddressId")
      .notEmpty()
      .withMessage("Customer Address is required"),
    check("purchaseQty")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 1 })
      .withMessage("Only positive numeric value acceptable"),
  ],
  handleValidationError,
  purchaseBook
);

router.post(
  "/purchaseCart",
  isSignedIn,
  [
    check("customerAddressId")
      .notEmpty()
      .withMessage("Customer Address is required"),
  ],
  handleValidationError,
  purchaseCart
);

router.delete(
  "/cancelOrder",
  isSignedIn,
  [check("orderId").notEmpty().withMessage("Order Id required")],
  handleValidationError,
  cancelOrder
);

module.exports = router;
