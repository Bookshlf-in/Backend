const Messages = require("../models/messages");

exports.getMessageList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfMessagesInOnePage = Number(req.query.noOfMessagesInOnePage) || 10;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfMessagesInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfMessagesInOnePage should be positive" });
    }
    const messageCount = await Messages.countDocuments();
    const messages = await Messages.find()
      .sort({ createdAt: 1 })
      .skip((page - 1) * noOfMessagesInOnePage)
      .limit(noOfMessagesInOnePage)
      .exec();
    return res.json({
      totalPages: Math.ceil(messageCount / noOfMessagesInOnePage),
      data: messages,
    });
  } catch (error) {
    console.log("Error in /admin-getMessageList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const message = await Messages.findOne({ _id: messageId }).select({
      _id: 1,
    });
    if (!message) {
      return res.status(400).json({ error: "Message does not exist" });
    }
    const updatedMessage = await Messages.updateOne(
      { _id: messageId },
      { read: true }
    );
    if (updatedMessage.nModified !== 1) {
      return res.status(500).json({ msg: "Unable to mark message as read" });
    }
    res.json({ msg: "Marked message as read" });
  } catch (error) {
    console.log("Error in /admin-markMessageAsRead ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markMessageAsUnread = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const message = await Messages.findOne({ _id: messageId }).select({
      _id: 1,
    });
    if (!message) {
      return res.status(400).json({ error: "Message does not exist" });
    }
    const updatedMessage = await Messages.updateOne(
      { _id: messageId },
      { read: false }
    );
    if (updatedMessage.nModified !== 1) {
      return res.status(500).json({ msg: "Unable to mark message as unread" });
    }
    res.json({ msg: "Marked message as unread" });
  } catch (error) {
    console.log("Error in /admin-markMessageAsUnRead ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const message = await Messages.findOne({ _id: messageId }).select({
      _id: 1,
    });
    if (!message) {
      return res.status(400).json({ error: "Message does not exist" });
    }
    const deletedMessage = await Messages.deleteOne({ _id: messageId });
    if (deletedMessage.deletedCount !== 1) {
      return res.status(500).json({ error: "Unable to delete message" });
    }
    res.json({ msg: "Deleted message" });
  } catch (error) {
    console.log("Error in /admin-deleteMessage ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
