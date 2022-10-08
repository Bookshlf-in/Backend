const mongoose = require("mongoose");
const Messages = require("../models/messages");
const Users = require("../models/users");

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.auth?._id;
    if (userId) {
      const user = await Users.findOne({ _id: userId });
      req.body.name = user.name;
      req.body.email = user.email;
    } else if (!req.body.name) {
      return res
        .status(400)
        .json({ errors: [{ error: "Name required", param: "name" }] });
    } else if (!req.body.email) {
      return res
        .status(400)
        .json({ errors: [{ error: "Email required", param: "email" }] });
    }
    if (req.body.queryType === "ORDER_HELP") {
      if (
        req.body.orderId &&
        !mongoose.Types.ObjectId.isValid(req.body.orderId)
      ) {
        return res
          .status(400)
          .json({ errors: [{ error: "Invalid order id", param: "orderId" }] });
      }
    } else {
      delete req.body.orderId;
    }
    const message = new Messages(req.body);
    message.save((error, message) => {
      if (error) {
        res.status(500).json({
          error: "Failed to send message",
        });
      } else {
        res.json({ msg: "Message send" });
      }
    });
  } catch (error) {
    console.log("Error occurred in /sendMessage", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
