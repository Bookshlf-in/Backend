const mongoose = require("mongoose");

const commissionSchema = mongoose.Schema({
  priceLimit: {
    type: Number,
    required: true,
  },
  fixedCommission: {
    type: Number,
    required: true,
  },
  percentCommission: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Commissions", commissionSchema);
