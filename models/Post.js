const mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      max: 50,
    },
    imageUrl: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: [
      {
        userId: String,
        comment: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
