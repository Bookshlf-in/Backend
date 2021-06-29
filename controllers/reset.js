const User = require("../models/users");
const Addresses = require("../models/addresses");
const Messages = require("../models/messages");
const Newsletters = require("../models/newsletters.js");
const WebsiteReviews = require("../models/websiteReviews");
const EmailOtp = require("../models/emailOtps");

exports.reset = async (req, res) => {
  try {
    await User.deleteMany().exec();
    await Addresses.deleteMany().exec();
    await Messages.deleteMany().exec();
    await Newsletters.deleteMany().exec();
    await WebsiteReviews.deleteMany().exec();
    await EmailOtp.deleteMany().exec();
    res.send("Reset successfull");
  } catch (error) {
    console.log("Error in /reset", error);
    res.status(500).json({ msg: "Reset Failed", error: error });
  }
};
