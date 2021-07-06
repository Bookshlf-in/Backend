const express = require("express");
const router = express.Router();

const { isSignedIn } = require("../controllers/auth");
const { sellerRegister } = require("../controllers/seller");

router.post("/sellerRegister", isSignedIn, sellerRegister);

module.exports = router;
