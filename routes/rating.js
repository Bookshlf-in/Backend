const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  addRating,
  updateRating,
  deleteRating,
} = require("../controllers/rating");
const { isSignedIn } = require("../controllers/auth");

router.post(
  "/addRating",
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
  addRating
);

router.post(
  "/updateRating",
  isSignedIn,
  [
    check("ratingId").notEmpty().withMessage("Rating Id required"),
    check("rating")
      .notEmpty()
      .withMessage("Rating requird")
      .isNumeric()
      .withMessage("Rating should be numeric")
      .custom((value) => value >= 1 && value <= 5)
      .withMessage("Rating should be between 1 and 5"),
  ],
  handleValidationError,
  updateRating
);

router.delete(
  "/deleteRating",
  isSignedIn,
  [check("ratingId").notEmpty().withMessage("Rating Id required")],
  handleValidationError,
  deleteRating
);

module.exports = router;
