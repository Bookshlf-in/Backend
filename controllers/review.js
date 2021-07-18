const mongoose = require("mongoose");
const Orders = require("../models/orders");
const Reviews = require("../models/reviews");
const SellerProfiles = require("../models/sellerProfiles");

exports.getReview = async (req, res) => {
  try {
    const orderId = req.query?.orderId;
    if (!mongoose.isValidObjectId(orderId)) {
      return res
        .status(400)
        .json({ errors: { error: "Order does not exist", param: "orderId" } });
    }
    const review = await Reviews.findOne({
      customerId: req.auth._id,
      orderId,
    }).select({ rating: 1, review: 1 });
    res.json(review);
  } catch (error) {
    console.log("Error occurred at /getReview ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

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
    const newReviewObj = {
      ...order,
      orderId,
      rating: req.body.rating,
    };
    if (req.body.review) newReviewObj.review = req.body.review;
    const newReview = new Reviews(newReviewObj);
    await newReview.save();

    const sellerProfile = await SellerProfiles.findOne({
      _id: newReview.sellerId,
    })
      .select({
        rating: 1,
        noOfRatings: 1,
      })
      .exec();
    const sellerRating =
      (sellerProfile.rating * sellerProfile.noOfRatings + req.body.rating) /
      (1 + sellerProfile.noOfRatings);
    let updateSellerObj = {};
    if (req.body.review) {
      updateSellerObj = {
        rating: sellerRating,
        $inc: { noOfRatings: 1, noOfReviews: 1 },
      };
    } else {
      updateSellerObj = {
        rating: sellerRating,
        $inc: { noOfRatings: 1 },
      };
    }
    await SellerProfiles.updateOne(
      { _id: newReview.sellerId },
      updateSellerObj
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
    const updateReviewObj = {
      rating: req.body.rating,
    };
    if (req.body.review) updateReviewObj.review = req.body.review;
    const updatedReview = await Reviews.updateOne(
      { _id: reviewId },
      updateReviewObj
    ).exec();
    if (updatedReview.nModified != 1) {
      return res.status(500).json({ error: "Failed to update review" });
    }

    const sellerProfile = await SellerProfiles.findOne({
      _id: review.sellerId,
    })
      .select({
        rating: 1,
        noOfRatings: 1,
      })
      .exec();
    const sellerRating =
      (sellerProfile.rating * sellerProfile.noOfRatings -
        review.rating +
        req.body.rating) /
      sellerProfile.noOfRatings;
    let updateSellerObj = {};
    if (!review.review && req.body.review) {
      updateSellerObj = {
        rating: sellerRating,
        $inc: { noOfReviews: 1 },
      };
    } else {
      updateSellerObj = {
        rating: sellerRating,
      };
    }
    await SellerProfiles.updateOne({ _id: review.sellerId }, updateSellerObj);

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

    let updateSellerObj = {};
    if (review.review) {
      updateSellerObj = {
        $inc: { noOfRatings: -1, noOfReviews: -1 },
      };
    } else {
      updateSellerObj = {
        $inc: { noOfRatings: -1 },
      };
    }
    await SellerProfiles.updateOne({ _id: review.sellerId }, updateSellerObj);

    res.json({ msg: "Review deleted" });
  } catch (error) {
    console.log("Error deleting review in /deleteReview ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
