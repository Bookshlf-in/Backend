const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/review");
const { isSignedIn } = require("../controllers/auth");

router.post(
  "/addReview",
  isSignedIn,
  [
    check("orderId").notEmpty().withMessage("Order Id required"),
    check("review").notEmpty().withMessage("Review required"),
  ],
  handleValidationError,
  addReview
);

router.post(
  "/updateReview",
  isSignedIn,
  [
    check("reviewId").notEmpty().withMessage("Review Id required"),
    check("review").notEmpty().withMessage("Review required"),
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
