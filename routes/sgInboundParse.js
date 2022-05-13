const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const { sgInboundParse } = require("../controllers/sgInboundParse");

router.post("/sgInboundParse", upload.none(), sgInboundParse);

module.exports = router;
