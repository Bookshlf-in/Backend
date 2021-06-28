const Newsletters = require("../models/newsletters.js");

exports.newsletterSubscribe = (req, res) => {
  const { email } = req.body;

  Newsletters.findOne({ email }, (error, newsletter) => {
    if (error) {
      return res.status(500).json({
        error: "Failed to subscribe",
      });
    } else if (newsletter) {
      return res.status(400).json({
        error: "Already subscribed",
      });
    } else {
      const newsletter = new Newsletters({ email });
      newsletter.save((error, newsletter) => {
        if (error) {
          return res.status(500).json({
            error: "Failed to subscribe",
          });
        }
        return res.json({
          email: newsletter.email,
          msg: "Added subscription",
        });
      });
    }
  });
};

exports.newsletterUnsubscribe = (req, res) => {
  const { email } = req.body;

  Newsletters.findOne({ email }, (error, newsletter) => {
    if (error) {
      return res.status(500).json({
        error: "Failed to unsubscribe",
      });
    } else if (!newsletter) {
      return res.status(400).json({
        error: "No subscription found",
      });
    } else {
      Newsletters.deleteOne({ email }, (error, newsletter) => {
        if (error) {
          return res.status(5).json({
            error: "Failed to unsubscribe",
          });
        }
        return res.json({
          email: email,
          msg: "Removed subscription",
        });
      });
    }
  });
};
