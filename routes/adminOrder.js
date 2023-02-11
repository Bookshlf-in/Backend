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
  getOrderList,
  getOrderDetails,
  updateOrder,
  changeOrderProgress,
  addOrderStatus,
  markOrderAsPacked,
  markOrderAsShipped,
  markOrderAsCompleted,
  markOrderAsCancelled,
  sendSellerPayment,
  purchaseBook,
} = require("../controllers/adminOrder");

const checkOrderId = [
  check("orderId")
    .notEmpty()
    .withMessage("Order Id is required")
    .custom((orderId) => mongoose.isValidObjectId(orderId))
    .withMessage("Invalid Order Id"),
];

router.get(
  "/admin-getOrderList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  getOrderList
);

router.get(
  "/admin-getOrderDetails",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  handleValidationError,
  getOrderDetails
);

router.post(
  "/admin-updateOrder",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  handleValidationError,
  updateOrder
);

router.post(
  "/admin-changeOrderProgress",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  [
    check("progress")
      .notEmpty()
      .withMessage("Progress required")
      .isNumeric()
      .withMessage("Progress should be numeric"),
  ],
  handleValidationError,
  changeOrderProgress
);

router.post(
  "/admin-addOrderStatus",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  [check("status").notEmpty().withMessage("Status required")],
  handleValidationError,
  addOrderStatus
);

router.post(
  "/admin-markOrderAsPacked",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  handleValidationError,
  markOrderAsPacked
);

router.post(
  "/admin-markOrderAsShipped",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  handleValidationError,
  markOrderAsShipped
);

router.post(
  "/admin-markOrderAsCompleted",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  handleValidationError,
  markOrderAsCompleted
);

router.post(
  "/admin-markOrderAsCancelled",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  handleValidationError,
  markOrderAsCancelled
);

router.post(
  "/admin-sendSellerPayment",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  checkOrderId,
  handleValidationError,
  sendSellerPayment
);

router.post(
  "/admin-purchaseBook",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ORDERS"),
  [
    check("bookId").notEmpty().withMessage("Book Id is required"),
    check("customerId").notEmpty().withMessage("Customer Id is required"),
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

module.exports = router;
