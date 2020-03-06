const express = require("express");

const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const connectDb = require("./connection");

const Account = require("./Accounts.model");
const Faction = require("./Factions.model");
const userRouter = require("./Users.API");
const ideaRouter = require("./Ideas.API");

const app = express();
var apiRouter = express.Router();

app.use(bodyParser.json());

apiRouter.use("/users", userRouter);
apiRouter.use("/ideas", ideaRouter);
app.use("/api", apiRouter);

app.use(function(req, res, next) {
  res.status(404).send("The Web Service doesn't know what you are looking for");
});

app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log("process environment", process.env.NODE_ENV);
app.listen(process.env.PORT || 8080, () => {
  connectDb().then(() => {
    console.log("database connected");
  });
});
