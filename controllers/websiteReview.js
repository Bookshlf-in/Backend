const WebsiteReviews = require("../models/websiteReviews");
const Users = require("../models/users");
const { websiteReviewCache } = require("../functions/cache");

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

exports.getTopWebsiteReviews = async (req, res) => {
  try {
    let websiteReviews = await websiteReviewCache.get("websiteReviews");
    if (websiteReviews) {
      return res.json(websiteReviews);
    }
    websiteReviews = await WebsiteReviews.find({
      review: { $nin: [undefined, ""] },
      rating: 5,
    })
      .sort({ createdAt: 1 })
      .limit(10)
      .select({
        userName: 1,
        rating: 1,
        review: 1,
      })
      .exec();
    websiteReviewCache.set("websiteReviews", websiteReviews);
    res.json(websiteReviews);
  } catch (error) {
    console.log("Error occurred at /getTopWebsiteReviews: ", error);
    res.json({ error: "Some error occurred" });
  }
};
