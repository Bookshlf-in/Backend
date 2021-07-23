const mongoose = require("mongoose");
const Users = require("../models/users");
const SellerProfiles = require("../models/sellerProfiles");
const Books = require("../models/books");
const Addresses = require("../models/addresses");

exports.getSellerList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfSellersInOnePage = Number(req.query.noOfSellersInOnePage) || 10;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfSellersInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfSellersInOnePage should be positive" });
    }
    const sellerCount = await SellerProfiles.countDocuments();
    const sellerList = await SellerProfiles.find()
      .skip((page - 1) * noOfSellersInOnePage)
      .limit(noOfSellersInOnePage);
    return res.json({
      totalPages: Math.ceil(sellerCount / noOfSellersInOnePage),
      data: sellerList,
    });
  } catch (error) {
    console.log("Error occurred in /admin-getSellerList");
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getSellerProfile = async (req, res) => {
  try {
    const email = req.query?.email;
    const sellerId = req.query?.sellerId;
    let findObj = {};
    if (email) {
      const user = await Users.findOne({ email }).select({ _id: 1 });
      findObj = { userId: user.id };
    } else if (sellerId && mongoose.isValidObjectId(sellerId)) {
      findObj = { _id: sellerId };
    } else {
      return res.status(400).json({ error: "Email or SellerId required" });
    }
    const sellerProfile = await SellerProfiles.findOne(findObj);
    if (!sellerProfile) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    res.json(sellerProfile);
  } catch (error) {
    console.log("Error occurred in /admin-getSellerProfile");
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getSellerBookList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfBooksInOnePage = Number(req.query.noOfBooksInOnePage) || 10;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfBooksInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfBooksInOnePage should be positive" });
    }
    const sellerId = req.query?.sellerId;
    const sellerProfile = await SellerProfiles.findOne({
      _id: sellerId,
    }).select({ _id: 1 });
    if (!sellerProfile) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    const sellerBookCount = await Books.countDocuments({ sellerId });
    const sellerBookList = await Books.find({ sellerId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * noOfBooksInOnePage)
      .limit(noOfBooksInOnePage)
      .exec();
    return res.json({
      totalPages: Math.ceil(sellerBookCount / noOfBooksInOnePage),
      data: sellerBookList,
    });
  } catch (error) {
    console.log("Error occurred in /admin-getSellerBookList");
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getSellerAddressList = async (req, res) => {
  try {
    const sellerId = req.query?.sellerId;
    const sellerProfile = await SellerProfiles.findOne({
      _id: sellerId,
    }).select({ _id: 1, userId: 1 });
    if (!sellerProfile) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    const userId = sellerProfile.userId;
    const addressList = await Addresses.find({ userId });
    res.json(addressList);
  } catch (error) {
    console.log("Error occurred in /admin-getSellerAddressList");
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markSellerAsVerified = async (req, res) => {
  try {
    const sellerId = req.body?.sellerId;
    const sellerProfile = await SellerProfiles.findOne({
      _id: sellerId,
    }).select({ _id: 1 });
    if (!sellerProfile) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    const updatedSeller = await SellerProfiles.updateOne(
      { _id: sellerId },
      { isVerified: true }
    );
    if (updatedSeller.nModified !== 1) {
      return res
        .status(500)
        .json({ error: "Failed to mark seller as verified" });
    }
    return res.json({ msg: "Marked seller as verified" });
  } catch (error) {
    console.log("Error occurred in /admin-markSellerAsVerified");
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markSellerAsUnverified = async (req, res) => {
  try {
    const sellerId = req.body?.sellerId;
    const sellerProfile = await SellerProfiles.findOne({
      _id: sellerId,
    }).select({ _id: 1 });
    if (!sellerProfile) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    const updatedSeller = await SellerProfiles.updateOne(
      { _id: sellerId },
      { isVerified: false }
    );
    if (updatedSeller.nModified !== 1) {
      return res
        .status(500)
        .json({ error: "Failed to mark seller as unverified" });
    }
    return res.json({ msg: "Marked seller as unverified" });
  } catch (error) {
    console.log("Error occurred in /admin-markSellerAsUnverified");
    res.status(500).json({ error: "Some error occurred" });
  }
};
