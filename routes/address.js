const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { handleValidationError } = require("../functions/validator");
const { isSignedIn } = require("../controllers/auth");

const {
  addAddress,
  getAddress,
  deleteAddress,
  getAddressList,
} = require("../controllers/address");

router.post(
  "/addAddress",
  isSignedIn,
  [
    check("phoneNo")
      .isLength({ min: 1 })
      .withMessage("phone number is required"),
    check("address").isLength({ min: 1 }).withMessage("Address is required"),
    check("city").isLength({ min: 1 }).withMessage("City name is required"),
    check("state").isLength({ min: 1 }).withMessage("State name is required"),
    check("zipCode").isLength({ min: 1 }).withMessage("Zip code is required"),
  ],
  handleValidationError,
  addAddress
);

router.get(
  "/getAddress",
  isSignedIn,
  [
    check("addressId")
      .isLength({ min: 1 })
      .withMessage("Address Id is required"),
  ],
  handleValidationError,
  getAddress
);

router.get("/getAddressList", isSignedIn, getAddressList);

router.delete(
  "/deleteAddress",
  isSignedIn,
  [
    check("addressId")
      .isLength({ min: 1 })
      .withMessage("Address Id is required"),
  ],
  handleValidationError,
  deleteAddress
);

module.exports = router;
