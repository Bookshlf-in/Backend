const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const accountRoutes = require("./account");
const addressRoutes = require("./address");

router.use("/", authRoutes);
router.use("/", accountRoutes);
router.use("/", addressRoutes);

module.exports = router;
