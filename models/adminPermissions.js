const mongoose = require("mongoose");

const PERMISSIONS = [
  "BOOKS",
  "ORDERS",
  "SEND_EMAIL",
  "MESSAGES",
  "SELLERS",
  "USERS",
  "WALLET",
  "ANALYTICS",
  "MANAGE_PERMISSIONS",
];

const adminPermissionsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    permissions: {
      type: [String],
      enum: PERMISSIONS,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminPermissions", adminPermissionsSchema);
