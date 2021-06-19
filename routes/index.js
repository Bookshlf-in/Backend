const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const accountRoutes = require("./account");

router.use("/", authRoutes);
router.use("/", accountRoutes);

module.exports = router;
