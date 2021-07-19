const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Tags", tagSchema);
