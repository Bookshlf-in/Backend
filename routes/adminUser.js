const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn, isAdmin } = require("../controllers/auth");
const {
  getUserList,
  getUserProfile,
  getUserAddressList,
  getUserOrderList,
} = require("../controllers/adminUser");

const checkUserId = [
  check("userId")
    .notEmpty()
    .withMessage("User Id is required")
    .custom((userId) => mongoose.isValidObjectId(userId))
    .withMessage("Invalid User Id"),
];

router.get("/admin-getUserList", isSignedIn, isAdmin, getUserList);

router.get("/admin-getUserProfile", isSignedIn, isAdmin, getUserProfile);

router.get(
  "/admin-getUserAddressList",
  isSignedIn,
  isAdmin,
  checkUserId,
  handleValidationError,
  getUserAddressList
);
router.get(
  "/admin-getUserOrderList",
  isSignedIn,
  isAdmin,
  checkUserId,
  handleValidationError,
  getUserOrderList
);

module.exports = router;
