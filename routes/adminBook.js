const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const mongoose = require("mongoose");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isAdmin } = require("../controllers/auth");
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

router.get("/admin-getBookList", isSignedIn, isAdmin, getBookList);

router.get(
  "/admin-getBookDetails",
  isSignedIn,
  isAdmin,
  checkBookId,
  handleValidationError,
  getBookDetails
);

router.post(
  "/admin-updateBookDetails",
  isSignedIn,
  isAdmin,
  checkBookId,
  handleValidationError,
  updateBookDetails
);

router.post(
  "/admin-approveBook",
  isSignedIn,
  isAdmin,
  checkBookId,
  handleValidationError,
  approveBook
);

router.post(
  "/admin-rejectBookApproval",
  isSignedIn,
  isAdmin,
  checkBookId,
  [check("message").notEmpty().withMessage("Rejection message is required")],
  handleValidationError,
  rejectBookApproval
);

router.delete(
  "/admin-deleteBook",
  isSignedIn,
  isAdmin,
  checkBookId,
  handleValidationError,
  deleteBook
);

module.exports = router;
