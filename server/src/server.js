require("dotenv").config();
const express = require("express");
const hubspot = require("@hubspot/api-client");
const bodyParser = require("body-parser");
const path = require("path");
const connectDb = require("./connection");
const Users = require("./Users.model");
const Idea = require("./Ideas.model");
const Account = require("./Accounts.model");
const Faction = require("./Factions.model");

const app = express();
var apiRouter = express.Router();

app.use(bodyParser.json());

const { CLIENT_ID, BASE_URL, SCOPES, CLIENT_SECRET } = process.env;

const REDIRECT_URL = `${BASE_URL}/callback`;

const hubspotClient = new hubspot.Client();

app.get("/connect", async (req, res) => {
  const authorizationUrl = hubspotClient.oauth.getAuthorizationUrl(
    CLIENT_ID,
    REDIRECT_URL,
    SCOPES
  );

  res.redirect(authorizationUrl);
});

app.get("/callback", async (req, res) => {
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
    console.log(accountInfo);
    hubspotClient.setAccessToken(accountInfo.accessToken);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send(error.toString());
  }
});

apiRouter.get("/ideas", async (req, res) => {
  try {
    const allIdeas = await Idea.find({});
    res.send(allIdeas);
  } catch (err) {
    next(err);
  }
});

apiRouter.post("/ideas", async (req, res, next) => {
  const idea = req.body;
  console.log(idea);
  try {
    const dbResponse = await Idea.create(idea);
    console.log(dbResponse);
    res.send(dbResponse);
  } catch (err) {
    next(err);
  }
});

apiRouter.post("/users", async (req, res, next) => {
  const user = req.body;
  const { email, password, firstname, lastname } = user;
  const domain = email.substring(email.lastIndexOf("@") + 1);
  const newUser = new Users({
    email,
    password,
    firstname,
    lastname
  });
  try {
    const savedUser = await newUser.save();
    const faction = await Faction.findOneAndUpdate(
      {
        domain
      },
      {
        $push: { members: savedUser._id }
      },
      { upsert: true, new: true }
    );
    res.send({ savedUser, faction });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).send("User with email address already exists");
    }

    next(err);
  }
});

apiRouter.post("/users/login", async (req, res, next) => {
  const user = req.body;
  const { email, password } = user;
  try {
    const matchedUser = await Users.findOne({ email });
    if (matchedUser) {
      const isValidPassword = await matchedUser.comparePassword(password);
      if (isValidPassword) {
        matchedUser.numLogins++;
        matchedUser.lastLoginDate = new Date();
        let updatedUser = await matchedUser.save();
        //delete updatedUser.password;
        //console.log(updatedUser);
        safeUser = updatedUser.toObject();
        delete safeUser.password;
        res.status(200).send(safeUser);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    next(err);
  }
});

app.use("/api", apiRouter);

app.use(function(req, res, next) {
  res.status(404).send("This 404 is coming from the todo service");
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
