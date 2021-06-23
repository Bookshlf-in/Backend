const mongoose = require("mongoose");

const newsletterSchema = mongoose.Schema({
  email: {
    type: String,
    trim: true,
    require: true,
    unique: true,
  },
});

module.exports = mongoose.model("Newsletters", newsletterSchema);
