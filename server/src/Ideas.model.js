const mongoose = require("mongoose");
const User = require("./Users.model");
const ideaSchema = new mongoose.Schema({
  title: {
    type: String
  },
  detail: {
    type: String
  },
  comments: [
    {
      body: { type: String },
      createdAt: { type: Date, default: Date.now() },
      author: { type: mongoose.ObjectId, ref: User }
    }
  ],
  author: { type: mongoose.ObjectId, ref: User }
});
const Idea = mongoose.model("Idea", ideaSchema);

module.exports = Idea;
