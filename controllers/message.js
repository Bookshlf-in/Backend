const Messages = require("../models/messages");

exports.sendMessage = (req, res) => {
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
};
