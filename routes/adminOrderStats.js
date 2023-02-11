const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  isSignedIn,
  isAdmin,
  checkAdminPermission,
} = require("../controllers/auth");
const { getMonthOrderStats } = require("../controllers/adminOrderStats");

router.get(
  "/admin-getMonthOrderStats",
  isSignedIn,
  isAdmin,
  checkAdminPermission("ANALYTICS"),
  [
    check("month").notEmpty().withMessage("month required"),
    check("year").notEmpty().withMessage("year required"),
  ],
  handleValidationError,
  getMonthOrderStats
);

module.exports = router;
