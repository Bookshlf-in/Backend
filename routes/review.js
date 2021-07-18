const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/review");
const { isSignedIn } = require("../controllers/auth");

router.get(
  "/getReview",
  isSignedIn,
  [check("orderId").notEmpty().withMessage("Order Id required")],
  handleValidationError,
  getReview
);

router.post(
  "/addReview",
  isSignedIn,
  [
    check("orderId").notEmpty().withMessage("Order Id required"),
    check("rating")
      .notEmpty()
      .withMessage("Rating requird")
      .isNumeric()
      .withMessage("Rating should be numeric")
      .custom((value) => value >= 1 && value <= 5)
      .withMessage("Rating should be between 1 and 5"),
  ],
  handleValidationError,
  addReview
);

router.post(
  "/updateReview",
  isSignedIn,
  [
    check("reviewId").notEmpty().withMessage("Review Id required"),
    check("rating")
      .notEmpty()
      .withMessage("Rating requird")
      .isNumeric()
      .withMessage("Rating should be numeric")
      .custom((value) => value >= 1 && value <= 5)
      .withMessage("Rating should be between 1 and 5"),
  ],
  handleValidationError,
  updateReview
);

router.delete(
  "/deleteReview",
  isSignedIn,
  [check("reviewId").notEmpty().withMessage("Review Id required")],
  handleValidationError,
  deleteReview
);

module.exports = router;
