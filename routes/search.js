const express = require("express");
const router = express.Router();

const { getAuth } = require("../controllers/auth");
const { search } = require("../controllers/search");

router.get("/search", getAuth, search);

module.exports = router;
