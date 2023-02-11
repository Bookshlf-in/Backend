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
  getMessageList,
  markMessageAsRead,
  markMessageAsUnread,
  deleteMessage,
} = require("../controllers/adminMessage");

const checkMessageId = [
  check("messageId")
    .notEmpty()
    .withMessage("Message Id is required")
    .custom((messageId) => mongoose.isValidObjectId(messageId))
    .withMessage("Invalid Message Id"),
];

router.get(
  "/admin-getMessageList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("MESSAGES"),
  getMessageList
);

router.post(
  "/admin-markMessageAsRead",
  isSignedIn,
  isAdmin,
  checkAdminPermission("MESSAGES"),
  checkMessageId,
  handleValidationError,
  markMessageAsRead
);

router.post(
  "/admin-markMessageAsUnread",
  isSignedIn,
  isAdmin,
  checkAdminPermission("MESSAGES"),
  checkMessageId,
  handleValidationError,
  markMessageAsUnread
);

router.delete(
  "/admin-deleteMessage",
  isSignedIn,
  isAdmin,
  checkAdminPermission("MESSAGES"),
  checkMessageId,
  handleValidationError,
  deleteMessage
);

module.exports = router;
