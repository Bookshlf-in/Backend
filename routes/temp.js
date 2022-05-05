const express = require("express");
const router = express.Router();

const { getBestSellingBooks, getRecommendedBooks } = require("../controllers/temp");

router.get("/getBestSellingBooks", getBestSellingBooks);
router.get("/getUserRecommendedBooks", getBestSellingBooks);
router.get("/getRecommendedBooks", getRecommendedBooks);

module.exports = router;
