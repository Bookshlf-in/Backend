const mongoose = require("mongoose");
const Users = require("../models/users");
const SellerProfiles = require("../models/sellerProfiles");
const Reviews = require("../models/reviews");

exports.sellerRegister = async (req, res) => {
  try {
    req.body.userId = req.auth._id;
    const user = await Users.findOne({ _id: req.body.userId })
      .select({ _id: 0, name: 1, roles: 1 })
      .exec();
    if (user.roles.includes("seller")) {
      return res.status(400).json({ error: "Already a seller" });
    }
    if (!req.body.name) {
      req.body.name = user.name;
    }

    const sellerProfile = new SellerProfiles(req.body);
    sellerProfile.save((error, sellerProfile) => {
      if (error) {
        return res.json({ error: "Failed to register" });
      }
      Users.updateOne(
        { _id: sellerProfile.userId },
        { $push: { roles: "seller" } }
      ).exec((error, user) => {
        if (error) {
          return res.json({ error: "Failed to register" });
        }
        res.json({ msg: "Registed as seller" });
      });
    });
  } catch (error) {
    console.log("Error occurred in sellerRegister", error);
    res.status(500).json({ error: "Registeration failed" });
  }
};

exports.getSellerProfile = (req, res) => {
  const sellerId = req.query?.sellerId || req.auth?.sellerId;
  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    return res.status(400).json({ error: "Seller does not exist" });
  }
  const query = SellerProfiles.findOne({ _id: sellerId }).select({
    userId: 0,
    __v: 0,
  });
  query.exec((error, sellerProfile) => {
    if (error) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    res.json(sellerProfile);
  });
};

exports.updateSellerProfile = (req, res) => {
  const obj = {};
  if (req.body.name) obj.name = req.body.name;
  if (req.body.intro) obj.intro = req.body.intro;
  if (req.body.photo) obj.photo = req.body.photo;

  const query = SellerProfiles.updateOne({ userId: req.auth._id }, obj);
  query.exec((error, sellerProfile) => {
    if (error) {
      return res.status(500).json({ error: "Failed to update profile" });
    }
    res.json({ msg: "Profile updated" });
  });
};

exports.getSellerReviews = async (req, res) => {
  try {
    const page = req.query?.page ? req.query.page : 1;
    if (page <= 0) {
      return res.status(400).json({
        errors: { error: "page value should be positive", param: "page" },
      });
    }
    const sellerId = req.query?.sellerId || req.auth?.sellerId;
    if (!mongoose.isValidObjectId(sellerId)) {
      return res.status(400).json({
        errors: [
          {
            error: "Invalid seller Id",
            param: "sellerId",
          },
        ],
      });
    }
    const sellerProfile = (
      await SellerProfiles.findOne({ _id: sellerId })
        .select({
          _id: 0,
          rating: 1,
          noOfRatings: 1,
          noOfReviews: 1,
        })
        .exec()
    )?._doc;
    if (!sellerProfile) {
      return res.status(400).json({
        errors: [
          {
            error: "Seller does not exists",
            param: "sellerId",
          },
        ],
      });
    }
    const noOfReviews = await Reviews.countDocuments({ sellerId });
    const reviews = await Reviews.find({ sellerId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * 10)
      .limit(10)
      .select({
        customerName: 1,
        rating: 1,
        review: 1,
        updatedAt: 1,
      })
      .exec();
    const totalPages = Math.ceil(noOfReviews / 10);
    res.json({ ...sellerProfile, totalPages, data: reviews });
  } catch (error) {
    console.log("Error occurred at /getSellerReviews ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
