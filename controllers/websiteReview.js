const WebsiteReviews = require("../models/websiteReviews");
const Users = require("../models/users");

exports.getWebsiteReview = (req, res) => {
  const query = WebsiteReviews.findOne({ userId: req.auth._id }).select({
    userName: 1,
    rating: 1,
    review: 1,
    _id: 0,
  });
  query.exec((error, websiteReview) => {
    if (error) {
      console.log("Error finding website reviews in /getWebsiteReview", error);
      return res.status(500).json({
        error: "Failed to get review",
      });
    } else {
      return res.json(websiteReview);
    }
  });
};

exports.updateWebsiteReview = (req, res) => {
  const obj = { ...req.body, userId: req.auth._id };
  if (obj?.rating && obj.rating > 5) {
    return res.status(400).json({
      error: "Rating cannot be greater than 5",
    });
  } else if (obj?.rating && obj.rating < 1) {
    return res.status(400).json({
      error: "Rating cannot be smaller than 1",
    });
  }

  const query = Users.findOne({ _id: obj.userId }).select({ _id: 0, name: 1 });
  query.exec((error, user) => {
    if (error) {
      console.log("Error finding user at /updateWebsiteReview", error);
      return res.status(500).json({
        error: "Failed to update Review",
      });
    } else {
      obj.userName = user.name;
      WebsiteReviews.updateOne(
        { userId: obj.userId },
        obj,
        { upsert: true },
        (error, websiteReview) => {
          if (error) {
            console.log(
              "Error updating website review at /updateWebsiteReview",
              error
            );
            return res.status(500).json({
              error: "Failed to update Review",
            });
          } else {
            return res.json({ msg: "Review updated" });
          }
        }
      );
    }
  });
};

exports.deleteWebsiteReview = (req, res) => {
  const query = WebsiteReviews.deleteOne({ userId: req.auth._id });
  query.exec((error, websiteReview) => {
    if (error) {
      console.log(
        "Error deleting website review in /deleteWebsiteReview",
        error
      );
      return res.status(500).json({
        error: "Error deleting review",
      });
    } else {
      return res.json({ msg: "Review deleted" });
    }
  });
};

exports.getTopWebsiteReviews = (req, res) => {
  WebsiteReviews.find({ review: { $nin: [undefined, ""] } })
    .sort({ rating: -1 })
    .limit(6)
    .select({
      userName: 1,
      rating: 1,
      review: 1,
    })
    .exec((error, websiteReviews) => {
      if (error) {
        return res.status(500).json({ error: "Some error occurred" });
      }
      res.json(websiteReviews);
    });
};
