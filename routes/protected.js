const express = require("express");
const router = express.Router();

const { isSignedIn } = require("../controllers/auth");
const { protected } = require("../controllers/protected");

router.get("/protected", isSignedIn, protected);

module.exports = router;
