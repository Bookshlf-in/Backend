const Users = require("../models/users");
const Addresses = require("../models/addresses");
const Messages = require("../models/messages");
const Newsletters = require("../models/newsletters.js");
const WebsiteReviews = require("../models/websiteReviews");
const EmailOtp = require("../models/emailOtps");
const Books = require("../models/books");
const CartItems = require("../models/cartItems");
const WishlistItems = require("../models/wishlistItems");
const Orders = require("../models/orders");
const SellerProfiles = require("../models/sellerProfiles");

exports.reset = async (req, res) => {
  try {
    await Users.deleteMany().exec();
    await Addresses.deleteMany().exec();
    await Messages.deleteMany().exec();
    await Newsletters.deleteMany().exec();
    await WebsiteReviews.deleteMany().exec();
    await EmailOtp.deleteMany().exec();
    await Books.deleteMany().exec();
    await CartItems.deleteMany().exec();
    await WishlistItems.deleteMany().exec();
    await Orders.deleteMany().exec();
    await SellerProfiles.deleteMany().exec();
    res.send("Reset successfull");
  } catch (error) {
    console.log("Error in /reset", error);
    res.status(500).json({ msg: "Reset Failed", error: error });
  }
};
