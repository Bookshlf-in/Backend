const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const {
  getCommissionChart,
  getSellerEarning,
} = require("../controllers/commission");

router.get("/getCommissionChart", getCommissionChart);

router.get(
  "/getSellerEarning",
  [check("price").notEmpty().withMessage("Price is required")],
  handleValidationError,
  getSellerEarning
);

module.exports = router;
