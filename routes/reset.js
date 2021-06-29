const express = require("express");
const router = express.Router();

const { reset } = require("../controllers/reset");

router.get("/reset", reset);

module.exports = router;
