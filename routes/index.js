const express = require("express");
const router = express.Router();

const resetRoutes = require("./reset");
const authRoutes = require("./auth");
const accountRoutes = require("./account");
const addressRoutes = require("./address");
const newsletterRoutes = require("./newsletter");
const messageRoutes = require("./message");
const websiteReviewRoutes = require("./websiteReview");
const sellerRoutes = require("./seller");
const bookRoutes = require("./book");
const searchRoutes = require("./search");
const cartRoutes = require("./cart");
const wishlistRoutes = require("./wishlist");
const protectedRoutes = require("./protected");

router.use("/", resetRoutes);
router.use("/", authRoutes);
router.use("/", accountRoutes);
router.use("/", addressRoutes);
router.use("/", newsletterRoutes);
router.use("/", messageRoutes);
router.use("/", websiteReviewRoutes);
router.use("/", sellerRoutes);
router.use("/", bookRoutes);
router.use("/", searchRoutes);
router.use("/", cartRoutes);
router.use("/", wishlistRoutes);
router.use("/", protectedRoutes);

module.exports = router;
