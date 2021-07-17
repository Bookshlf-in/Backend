const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    bookId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    orderId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ratings", ratingSchema);
