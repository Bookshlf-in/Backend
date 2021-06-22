const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: Number,
      default: 91,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    altPhoneNo: {
      type: Number,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: Number,
      required: true,
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Addresses", addressSchema);
