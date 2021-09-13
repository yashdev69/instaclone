const mongoose = require("mongoose");
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

module.exports = mongooes.model("Post", postSchema);
