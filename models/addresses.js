const mongoose = require("mongoose");

const phoneNoSchema = new mongoose.Schema({
  countryCode: {
    type: Number,
    default: 91,
  },
  number: {
    type: Number,
    required: true,
  },
});

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
    phoneNo: {
      type: phoneNoSchema,
      required: true,
    },
    altPhoneNo: {
      type: phoneNoSchema,
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
