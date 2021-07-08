const Users = require("../models/users");
const SellerProfiles = require("../models/sellerProfiles");
const mongoose = require("mongoose");

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
  let findParameter;
  if (req.query?.sellerId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.sellerId)) {
      return res.status(400).json({ error: "Seller not exist" });
    }
    findParameter = { _id: req.query.sellerId };
  } else {
    findParameter = { userId: req.auth._id };
  }

  const query = SellerProfiles.findOne(findParameter).select({
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
