const User = require("../models/users");
const Addresses = require("../models/addresses");
const Messages = require("../models/messages");
const Newsletters = require("../models/newsletters.js");
const WebsiteReviews = require("../models/websiteReviews");
const EmailOtp = require("../models/emailOtps");

exports.reset = async (req, res) => {
  try {
    await User.collection.drop();
    await Addresses.collection.drop();
    await Messages.collection.drop();
    await Newsletters.collection.drop();
    await WebsiteReviews.collection.drop();
    await EmailOtp.collection.drop();
    res.send("Reset successfull");
  } catch (error) {
    console.log("Error in /reset", error);
    res.status(500).send("Reset Failed");
  }
};
