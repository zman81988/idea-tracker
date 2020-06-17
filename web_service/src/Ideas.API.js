const express = require("express");
const Idea = require("./Ideas.model");
const User = require("./Users.model");
var ideaRouter = express.Router();

ideaRouter.get("/:ideaID", async (req, res, next) => {
  const { ideaID } = req.params;
  try {
    const idea = await Idea.findOne({ _id: ideaID }).populate("author").exec();

    res.send(idea);
  } catch (err) {
    next(err);
  }
});

ideaRouter.get("/", async (req, res, next) => {
  try {
    const allIdeas = await Idea.find({}).populate("author").exec();

    res.send(allIdeas);
  } catch (err) {
    next(err);
  }
});

ideaRouter.post("/", async (req, res, next) => {
  const idea = req.body;
  console.log(idea);
  try {
    const dbResponse = await Idea.create(idea);
    const populatedIdea = await dbResponse.populate("author").execPopulate();
    res.send(populatedIdea);
  } catch (err) {
    next(err);
  }
});

ideaRouter.delete("/", async (req, res, next) => {
  try {
    await Idea.deleteMany({});
    res.send("All Ideas deleted");
  } catch (err) {
    next(err);
  }
});

module.exports = ideaRouter;
