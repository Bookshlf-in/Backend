const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    customerName: {
      type: String,
    },
    bookId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    author: {
      type: String,
    },
    MRP: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    purchaseQty: {
      type: Number,
      required: true,
    },
    weightInGrams: {
      type: Number,
      required: true,
    },
    status: {
      type: Array,
      default: [],
    },
    expectedDeliveryDate: {
      type: Date,
    },
    paymentMode: {
      type: String,
      default: "Cash on delivery",
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    sellerAddress: {
      type: Object,
      required: true,
    },
    customerAddress: {
      type: Object,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    orderTotal: {
      type: Number,
      required: true,
    },
    externalTrackingDetails: {
      type: String,
    },
    externalTrackingLink: {
      type: String,
    },
    isSellerPaid: {
      type: Boolean,
      default: false,
    },
    sellerTransactionId: {
      type: mongoose.Types.ObjectId,
    },
    adminDeliveryExpense: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema);
