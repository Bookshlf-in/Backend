const mongoose = require("mongoose");

const sellerTransactionSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    txnNumber: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    bookId: {
      type: mongoose.Types.ObjectId,
    },
    orderId: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sellerTransactions", sellerTransactionSchema);
