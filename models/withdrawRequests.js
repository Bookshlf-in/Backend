const mongoose = require("mongoose");

const withdrawRequestSchema = mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    bankAccountDetails: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    adminMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("withdrawRequests", withdrawRequestSchema);
