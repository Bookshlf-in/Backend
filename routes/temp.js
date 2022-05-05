const express = require("express");
const router = express.Router();

const { getAuth } = require("../controllers/auth");

const { getBestSellingBooks, getUserRecommendedBooks, getRecommendedBooks } = require("../controllers/temp");

router.get("/getBestSellingBooks", getAuth, getBestSellingBooks);
router.get("/getUserRecommendedBooks", getAuth, getUserRecommendedBooks);
router.get("/getRecommendedBooks", getAuth, getRecommendedBooks);

module.exports = router;
