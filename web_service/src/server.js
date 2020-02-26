require("dotenv").config();
const express = require("express");
const hubspot = require("@hubspot/api-client");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const connectDb = require("./connection");
const Users = require("./Users.model");
const Idea = require("./Ideas.model");
const Account = require("./Accounts.model");
const Faction = require("./Factions.model");

const app = express();
var apiRouter = express.Router();

app.use(bodyParser.json());

const { CLIENT_ID, BASE_URL, SCOPES, CLIENT_SECRET } = process.env;

const REDIRECT_URL = `${BASE_URL}/oauth/callback`;

const hubspotClient = new hubspot.Client();

const getAndSaveHubSpotContacts = async accessToken => {
  try {
    hubspotContacts = await axios.get(
      `http://hubspot_service:8080/api/contacts/${accessToken}`
    );
  } catch (err) {
    console.log(err);
  }

  for (const contact of hubspotContacts.data) {
    try {
      const user = await Users.findOneAndUpdate(
        { email: contact.properties.email },
        { hubspotContactId: contact.id }
      );
    } catch (err) {
      //console.log(err);
    }
  }
};

const setUpHubSpotProperties = async accessToken => {
  try {
    propertiesResponse = await axios.get(
      `http://hubspot_service:8080/api/properties/${accessToken}`
    );
  } catch (err) {
    console.log(err);
  }
};

const updateExistingHubSpotContacts = async (accessToken, pageNumber) => {
  const CONTACTS_PER_PAGE = 2;
  const skip = pageNumber * CONTACTS_PER_PAGE;
  try {
    const pageOfContactsFromDB = await Users.find(
      { hubspotContactId: { $exists: true } },
      null,
      { skip, limit: CONTACTS_PER_PAGE }
    );
    await axios.post(
      `http://hubspot_service:8080/api/contacts/update/${accessToken}`,
      pageOfContactsFromDB
    );
    console.log(pageOfContactsFromDB);
    if (pageOfContactsFromDB.length > 0) {
      pageNumber++;
      return await updateExistingHubSpotContacts(accessToken, pageNumber);
    } else {
      console.log("Done updating contacts");
      return;
    }
  } catch (err) {
    console.log(err);
  }
};

const initialSyncWithHubSpot = async accessToken => {
  await getAndSaveHubSpotContacts(accessToken);
  await setUpHubSpotProperties(accessToken);
  await updateExistingHubSpotContacts(accessToken, 0);
};

app.get("/oauth/connect", async (req, res) => {
  const authorizationUrl = hubspotClient.oauth.getAuthorizationUrl(
    CLIENT_ID,
    REDIRECT_URL,
    SCOPES
  );

  res.redirect(authorizationUrl);
});

app.get("/oauth/callback", async (req, res) => {
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
    initialSyncWithHubSpot(accountInfo.accessToken);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send(error.toString());
  }
});

apiRouter.get("/ideas", async (req, res, next) => {
  try {
    const allIdeas = await Idea.find({})
      .populate("author")
      .exec();

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

apiRouter.delete("/ideas", async (req, res, next) => {
  try {
    await Idea.deleteMany({});
    res.send("All Ideas deleted");
  } catch (err) {
    next(err);
  }
});

apiRouter.get("/users", async (req, res, next) => {
  try {
    const users = await Users.find({});
    res.send(users);
    // pingResponse = await axios.get("http://hubspot_service:8080/api/ping");
    // console.log(pingResponse.data);
    // res.send(pingResponse.data);
  } catch (err) {
    next(err);
  }
});

apiRouter.delete("/users", async (req, res, next) => {
  try {
    await Users.deleteMany({});
    res.send("Delted all users");
  } catch (err) {
    next(err);
  }
});

apiRouter.post("/users", async (req, res, next) => {
  const user = req.body;
  const { email } = user;
  console.log(user);
  const domain = email.substring(email.lastIndexOf("@") + 1);
  const newUser = new Users(user);
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
