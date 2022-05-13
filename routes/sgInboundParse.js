const express = require("express");
const router = express.Router();

const { sgInboundParse } = require("../controllers/sgInboundParse");

router.post("/sgInboundParse", sgInboundParse);

module.exports = router;
