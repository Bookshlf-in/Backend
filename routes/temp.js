const express = require("express");
const router = express.Router();

const { getBestSellingBooks } = require("../controllers/temp");

router.get("/getBestSellingBooks", getBestSellingBooks);
router.get("/getUserRecommendedBooks", getBestSellingBooks);
router.get("/getRecommendedBooks", getBestSellingBooks);

module.exports = router;
