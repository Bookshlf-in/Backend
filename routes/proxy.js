const express = require("express");
const router = express.Router();

const { proxy } = require("../controllers/proxy");

router.all("/proxy/*", proxy);

module.exports = router;
