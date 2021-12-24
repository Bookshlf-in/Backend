const mongoose = require("mongoose");

const sellerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    altPhoneNo: {
      type: Number,
    },
    intro: {
      type: String,
      trim: true,
      default: "",
    },
    photo: {
      type: String,
      default: "",
    },
    noOfBooksSold: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    noOfRatings: {
      type: Number,
      default: 0,
    },
    noOfReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerProfiles", sellerProfileSchema);
