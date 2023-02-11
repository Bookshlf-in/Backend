const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const mongoose = require("mongoose");

const { handleValidationError } = require("../functions/validator");
const {
  isSignedIn,
  isAdmin,
  checkAdminPermission,
} = require("../controllers/auth");
const {
  getBookList,
  getBookDetails,
  updateBookDetails,
  approveBook,
  rejectBookApproval,
  deleteBook,
} = require("../controllers/adminBook");

const checkBookId = [
  check("bookId")
    .notEmpty()
    .withMessage("Book Id is required")
    .custom((bookId) => mongoose.isValidObjectId(bookId))
    .withMessage("Invalid Book Id"),
];

router.get(
  "/admin-getBookList",
  isSignedIn,
  isAdmin,
  checkAdminPermission("BOOKS"),
  getBookList
);

router.get(
  "/admin-getBookDetails",
  isSignedIn,
  isAdmin,
  checkAdminPermission("BOOKS"),
  checkBookId,
  handleValidationError,
  getBookDetails
);

router.post(
  "/admin-updateBookDetails",
  isSignedIn,
  isAdmin,
  checkAdminPermission("BOOKS"),
  checkBookId,
  handleValidationError,
  updateBookDetails
);

router.post(
  "/admin-approveBook",
  isSignedIn,
  isAdmin,
  checkAdminPermission("BOOKS"),
  checkBookId,
  handleValidationError,
  approveBook
);

router.post(
  "/admin-rejectBookApproval",
  isSignedIn,
  isAdmin,
  checkAdminPermission("BOOKS"),
  checkBookId,
  [check("message").notEmpty().withMessage("Rejection message is required")],
  handleValidationError,
  rejectBookApproval
);

router.delete(
  "/admin-deleteBook",
  isSignedIn,
  isAdmin,
  checkAdminPermission("BOOKS"),
  checkBookId,
  handleValidationError,
  deleteBook
);

module.exports = router;
