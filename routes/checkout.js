const express = require("express");
const router = express.Router();
const check = require("express-validator");

const { checkoutCart } = require("../controllers/checkout");
const { isSignedIn } = require("../controllers/auth");
const { handleValidationError } = require("../functions/validator");

router.get("/checkoutCart", isSignedIn, checkoutCart);

module.exports = router;
