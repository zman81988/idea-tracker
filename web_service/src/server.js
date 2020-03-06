const express = require("express");
const hubspot = require("@hubspot/api-client");
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

const { CLIENT_ID, BASE_URL, SCOPES, CLIENT_SECRET } = process.env;

const REDIRECT_URL = `${BASE_URL}/oauth/callback`;
const hubspotClient = new hubspot.Client();

app.use(bodyParser.json());

app.get("/oauth/connect", async (req, res) => {
  const authorizationUrl = hubspotClient.oauth.getAuthorizationUrl(
    CLIENT_ID,
    REDIRECT_URL,
    SCOPES
  );

  res.redirect(authorizationUrl);
});

app.get("/oauth/callback", async (req, res, next) => {
  const { code } = req.query;
  try {
    const tokensResponse = await hubspotClient.oauth.defaultApi.createToken(
      "authorization_code",
      code,
      REDIRECT_URL,
      CLIENT_ID,
      CLIENT_SECRET
    );
    const { accessToken, refreshToken, expiresIn } = tokensResponse.body;
    const expiresAt = new Date(Date.now() + expiresIn);

    const accountInfo = await Account.findOneAndUpdate(
      { accountId: 1 },
      { accessToken, refreshToken, expiresAt },
      { new: true, upsert: true }
    );

    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

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
