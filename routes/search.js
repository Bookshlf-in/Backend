const express = require("express");
const router = express.Router();

const { search } = require("../controllers/search");

router.get("/search", search);

module.exports = router;
