const express = require("express");
const router = express.Router();

const { searchTag } = require("../controllers/tag");

router.get("/searchTag", searchTag);

module.exports = router;
