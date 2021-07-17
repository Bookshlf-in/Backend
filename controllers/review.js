const mongoose = require("mongoose");
const Orders = require("../models/orders");
const Reviews = require("../models/reviews");
const SellerProfiles = require("../models/sellerProfiles");

exports.addReview = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        errors: [
          {
            error: "Order not found",
            param: "orderId",
          },
        ],
      });
    }
    const order = (
      await Orders.findOne({ _id: orderId }).select({
        _id: 0,
        customerId: 1,
        sellerId: 1,
        bookId: 1,
        customerName: 1,
      })
    )?._doc;
    if (!order) {
      return res.status(400).json({
        errors: [
          {
            error: "Order not found",
            param: "orderId",
          },
        ],
      });
    }
    if (!order.customerId.equals(req.auth._id)) {
      return res
        .status(400)
        .json({ error: "You are not authorized to review this order" });
    }
    const review = await Reviews.findOne({ customerId: req.auth._id, orderId });
    if (review) {
      return res.status(400).json({ error: "Already reviewed" });
    }
    const newReview = new Reviews({
      ...order,
      orderId,
      review: req.body.review,
    });
    await newReview.save();

    await SellerProfiles.updateOne(
      { _id: newReview.sellerId },
      { $inc: { noOfReviews: 1 } }
    );

    res.json({ msg: "Review added" });
  } catch (error) {
    console.log("Error occurred in /addReview", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        errors: [
          {
            error: "Review does not exists",
            param: "reviewId",
          },
        ],
      });
    }
    const review = await Reviews.findOne({ _id: reviewId }).exec();
    if (!review) {
      return res.status(400).json({
        errors: [
          {
            error: "Review does not exists",
            param: "reviewId",
          },
        ],
      });
    }
    if (!review.customerId.equals(req.auth._id)) {
      return res
        .status(400)
        .json({ error: "You are not authorized to update this review" });
    }
    const updatedReview = await Reviews.updateOne(
      { _id: reviewId },
      { review: req.body.review }
    ).exec();
    if (updatedReview.nModified != 1) {
      return res.status(500).json({ error: "Failed to update review" });
    }
    res.json({ msg: "Review updated" });
  } catch (error) {
    console.log("Error occurred updating review at /updateReview ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        errors: [
          {
            error: "Review does not exists",
            param: "reviewId",
          },
        ],
      });
    }
    const review = await Reviews.findOne({ _id: reviewId }).exec();
    if (!review) {
      return res.status(400).json({
        errors: [
          {
            error: "Review does not exists",
            param: "reviewId",
          },
        ],
      });
    }
    if (!review.customerId.equals(req.auth._id)) {
      return res
        .status(400)
        .json({ error: "You are not authorized to delete this review" });
    }
    const deletedReview = await Reviews.deleteOne({ _id: reviewId }).exec();
    if (deletedReview.deletedCount != 1) {
      return res.status(500).json({ error: "Failed to delete review" });
    }

    await SellerProfiles.updateOne(
      { _id: review.sellerId },
      { $inc: { noOfReviews: -1 } }
    );

    res.json({ msg: "Review deleted" });
  } catch (error) {
    console.log("Error deleting review in /deleteReview ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};