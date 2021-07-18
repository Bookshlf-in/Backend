const express = require("express");
const router = express.Router();

const { isSignedIn } = require("../controllers/auth");
const {
  getWebsiteReview,
  updateWebsiteReview,
  deleteWebsiteReview,
  getTopWebsiteReviews,
} = require("../controllers/websiteReview");

router.get("/getWebsiteReview", isSignedIn, getWebsiteReview);

router.post("/updateWebsiteReview", isSignedIn, updateWebsiteReview);

router.delete("/deleteWebsiteReview", isSignedIn, deleteWebsiteReview);

router.get("/getTopWebsiteReviews", getTopWebsiteReviews);

module.exports = router;
