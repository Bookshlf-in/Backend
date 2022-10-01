const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    queryType: {
      type: String,
      default: "GENERAL",
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    subject: {
      type: String,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    phoneNo: {
      type: Number,
    },
    orderId: {
      type: mongoose.Types.ObjectId,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", messageSchema);
