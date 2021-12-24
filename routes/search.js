const express = require("express");
const router = express.Router();

const { getAuth } = require("../controllers/auth");
const { search, searchTitle } = require("../controllers/search");

router.get("/search", getAuth, search);

router.get("/searchTitle", searchTitle);

module.exports = router;
