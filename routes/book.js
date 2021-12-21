const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isSeller, getAuth } = require("../controllers/auth");
const {
  addBook,
  deleteBook,
  getBookList,
  getBookDetails,
  updateBook,
} = require("../controllers/book");

router.post(
  "/addBook",
  isSignedIn,
  isSeller,
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("price").notEmpty().withMessage("Price is required"),
    check("pickupAddressId")
      .notEmpty()
      .withMessage("Pickup Address is required"),
  ],
  handleValidationError,
  addBook
);

router.get("/getBookList", isSignedIn, isSeller, getBookList);

router.get(
  "/getBookDetails",
  getAuth,
  [check("bookId").notEmpty().withMessage("Book Id is required")],
  handleValidationError,
  getBookDetails
);

router.post(
  "/updateBook",
  isSignedIn,
  isSeller,
  [check("bookId").notEmpty().withMessage("Book Id is required")],
  handleValidationError,
  updateBook
);

router.delete(
  "/deleteBook",
  isSignedIn,
  isSeller,
  [check("bookId").notEmpty().withMessage("Book Id is required")],
  handleValidationError,
  deleteBook
);

module.exports = router;
