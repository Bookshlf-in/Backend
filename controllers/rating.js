const mongoose = require("mongoose");
const Orders = require("../models/orders");
const Ratings = require("../models/ratings");
const SellerProfiles = require("../models/sellerProfiles");

exports.addRating = async (req, res) => {
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
        .json({ error: "You are not authorized to rate this order" });
    }
    const rating = await Ratings.findOne({ customerId: req.auth._id, orderId });
    if (rating) {
      return res.status(400).json({ error: "Already rated" });
    }
    const newRating = new Ratings({
      ...order,
      orderId,
      rating: req.body.rating,
    });
    await newRating.save();

    const sellerProfile = await SellerProfiles.findOne({
      _id: newRating.sellerId,
    })
      .select({
        rating: 1,
        noOfRatings: 1,
      })
      .exec();
    const sellerRating =
      (sellerProfile.rating * sellerProfile.noOfRatings + req.body.rating) /
      (1 + sellerProfile.noOfRatings);
    await SellerProfiles.updateOne(
      { _id: newRating.sellerId },
      { rating: sellerRating, $inc: { noOfRatings: 1 } }
    );

    res.json({ msg: "Rating added" });
  } catch (error) {
    console.log("Error occurred in /addRating", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { ratingId } = req.body;
    if (!mongoose.isValidObjectId(ratingId)) {
      return res.status(400).json({
        errors: [
          {
            error: "Rating does not exists",
            param: "ratingId",
          },
        ],
      });
    }
    const rating = await Ratings.findOne({ _id: ratingId }).exec();
    if (!rating) {
      return res.status(400).json({
        errors: [
          {
            error: "Rating does not exists",
            param: "ratingId",
          },
        ],
      });
    }
    if (!rating.customerId.equals(req.auth._id)) {
      return res
        .status(400)
        .json({ error: "You are not authorized to update this rating" });
    }
    const updatedRating = await Ratings.updateOne(
      { _id: ratingId },
      { rating: req.body.rating }
    ).exec();
    if (updatedRating.nModified != 1) {
      return res.status(500).json({ error: "Failed to update rating" });
    }

    const sellerProfile = await SellerProfiles.findOne({
      _id: rating.sellerId,
    })
      .select({
        rating: 1,
        noOfRatings: 1,
      })
      .exec();
    const sellerRating =
      (sellerProfile.rating * sellerProfile.noOfRatings -
        rating.rating +
        req.body.rating) /
      sellerProfile.noOfRatings;
    await SellerProfiles.updateOne(
      { _id: rating.sellerId },
      { rating: sellerRating }
    );

    res.json({ msg: "Rating updated" });
  } catch (error) {
    console.log("Error occurred updating rating at /updateRating ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.body;
    if (!mongoose.isValidObjectId(ratingId)) {
      return res.status(400).json({
        errors: [
          {
            error: "Rating does not exists",
            param: "ratingId",
          },
        ],
      });
    }
    const rating = await Ratings.findOne({ _id: ratingId }).exec();
    if (!rating) {
      return res.status(400).json({
        errors: [
          {
            error: "Rating does not exists",
            param: "ratingId",
          },
        ],
      });
    }
    if (!rating.customerId.equals(req.auth._id)) {
      return res
        .status(400)
        .json({ error: "You are not authorized to delete this rating" });
    }
    const deletedRating = await Ratings.deleteOne({ _id: ratingId }).exec();
    if (deletedRating.deletedCount != 1) {
      return res.status(500).json({ error: "Failed to delete rating" });
    }

    const sellerProfile = await SellerProfiles.findOne({
      _id: rating.sellerId,
    })
      .select({
        rating: 1,
        noOfRatings: 1,
      })
      .exec();
    const sellerRating =
      (sellerProfile.rating * sellerProfile.noOfRatings - rating.rating) /
      (sellerProfile.noOfRatings - 1);
    await SellerProfiles.updateOne(
      { _id: rating.sellerId },
      { rating: sellerRating, $inc: { noOfRatings: -1 } }
    );

    res.json({ msg: "Rating deleted" });
  } catch (error) {
    console.log("Error deleting rating in /deleteRating ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
