const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { signUp, signIn, signOut, isSignedIn } = require("../controllers/auth");

router.post(
  "/signUp",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("Name should be atleast 3 characters long"),
    check("email").isEmail().withMessage("Email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password should be atleast 6 characters long")
      .not()
      .isIn(["123456", "password"])
      .withMessage("Do not use a common word as the password"),
  ],
  signUp
);

router.post(
  "/signIn",
  [
    check("email").isEmail().withMessage("Email is required"),
    check("password").isLength({ min: 1 }).withMessage("Password is required"),
  ],
  signIn
);

router.get("/signOut", signOut);

module.exports = router;
