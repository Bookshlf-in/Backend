const mongoose = require("mongoose");

const websiteReviewSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    review: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebsiteReviews", websiteReviewSchema);
