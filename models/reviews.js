const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
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
    customerName: {
      type: String,
      requird: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewSchema);
