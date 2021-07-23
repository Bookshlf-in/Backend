const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isAdmin } = require("../controllers/auth");
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
} = require("../controllers/adminOrder");

const checkOrderId = [
  check("orderId")
    .notEmpty()
    .withMessage("Order Id is required")
    .custom((orderId) => mongoose.isValidObjectId(orderId))
    .withMessage("Invalid Order Id"),
];

router.get("/admin-getOrderList", isSignedIn, isAdmin, getOrderList);

router.get(
  "/admin-getOrderDetails",
  isSignedIn,
  isAdmin,
  checkOrderId,
  handleValidationError,
  getOrderDetails
);

router.post(
  "/admin-updateOrder",
  isSignedIn,
  isAdmin,
  checkOrderId,
  handleValidationError,
  updateOrder
);

router.post(
  "/admin-changeOrderProgress",
  isSignedIn,
  isAdmin,
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
  checkOrderId,
  [check("status").notEmpty().withMessage("Status required")],
  handleValidationError,
  addOrderStatus
);

router.post(
  "/admin-markOrderAsPacked",
  isSignedIn,
  isAdmin,
  checkOrderId,
  handleValidationError,
  markOrderAsPacked
);

router.post(
  "/admin-markOrderAsShipped",
  isSignedIn,
  isAdmin,
  checkOrderId,
  handleValidationError,
  markOrderAsShipped
);

router.post(
  "/admin-markOrderAsCompleted",
  isSignedIn,
  isAdmin,
  checkOrderId,
  handleValidationError,
  markOrderAsCompleted
);

router.post(
  "/admin-markOrderAsCancelled",
  isSignedIn,
  isAdmin,
  checkOrderId,
  handleValidationError,
  markOrderAsCancelled
);

module.exports = router;
