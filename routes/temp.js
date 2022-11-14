const express = require("express");
const router = express.Router();

const { lucknowData } = require("../controllers/temp");

router.get("/lucknowData", lucknowData);

module.exports = router;
