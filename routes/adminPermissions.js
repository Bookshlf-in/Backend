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
  getPermissionList,
  updatePermission,
} = require("../controllers/adminPermissions");

const PERMISSIONS = [
  "BOOKS",
  "ORDERS",
  "SEND_EMAIL",
  "MESSAGES",
  "SELLERS",
  "USERS",
  "WALLET",
  "ANALYTICS",
  "MANAGE_PERMISSIONS",
];

router.get(
  "/admin-getPermissionList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("MANAGE_PERMISSIONS"),
  getPermissionList
);

router.post(
  "/admin-updatePermission",
  isSignedIn,
  isAdmin,
  checkAdminPermission("MANAGE_PERMISSIONS"),
  [
    check("userId")
      .notEmpty()
      .withMessage("userId is required")
      .custom((userId) => mongoose.isValidObjectId(userId))
      .withMessage("userId is invalid"),
    check("permissions")
      .isArray()
      .withMessage("permissions is required")
      .isIn(PERMISSIONS)
      .withMessage("Permission Invalid"),
  ],
  handleValidationError,
  updatePermission
);

module.exports = router;
