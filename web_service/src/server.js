const express = require("express");

const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");

const kafka = require("kafka-node");

const connectDb = require("./connection");

const Account = require("./Accounts.model");
const Faction = require("./Factions.model");
const Users = require("./Users.model");
const userRouter = require("./Users.API");
const userHandler = require("./Users.webhook");
const ideaRouter = require("./Ideas.API");
const { hubspotClient } = require("./utils");

const app = express();
var apiRouter = express.Router();

const {
  CLIENT_ID,
  BASE_URL,
  SCOPES,
  CLIENT_SECRET,
  KAFKA_BROKER_LIST
} = process.env;

const client = new kafka.KafkaClient({ kafkaHost: KAFKA_BROKER_LIST });

const consumer = new kafka.Consumer(client, [
  { topic: "contact.propertyChange" }
]);

consumer.on("message", message => {
  console.log(message);
  userHandler(message);
});

consumer.on("error", err => {
  console.log(err);
});

const REDIRECT_URL = `${BASE_URL}/oauth/callback`;

app.use(bodyParser.json());

const getAndSaveHubSpotContacts = async accessToken => {
  console.log("Getting Contacts From HubSpot");
  try {
    const hubspotContacts = await axios.get(
      `http://hubspot_service:8080/api/contacts/${accessToken}`
    );
    for (const contact of hubspotContacts.data) {
      const user = await Users.findOneAndUpdate(
        { email: contact.properties.email },
        { hubspotContactId: contact.id }
      );
    }
  } catch (err) {
    console.log(err);
  }
};

const setUpHubSpotProperties = async accessToken => {
  console.log("Setting Up Properties");
  try {
    propertiesResponse = await axios.get(
      `http://hubspot_service:8080/api/properties/${accessToken}`
    );
  } catch (err) {
    console.log(err);
  }
};

const updateExistingHubSpotContacts = async (accessToken, pageNumber) => {
  console.log("updating existing contacts");
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

const createExistingContacts = async (accessToken, pageNumber) => {
  console.log("create existing contacts");
  const CONTACTS_PER_PAGE = 2;
  const skip = pageNumber * CONTACTS_PER_PAGE;
  try {
    const pageOfContactsFromDB = await Users.find(
      { hubspotContactId: { $exists: false } },
      null,
      { skip, limit: CONTACTS_PER_PAGE }
    );
    const createResponse = await axios.post(
      `http://hubspot_service:8080/api/contacts/create/${accessToken}`,
      pageOfContactsFromDB
    );

    for (const contact of createResponse.data.results) {
      await Users.findOneAndUpdate(
        { email: contact.email },
        { hubspotContactId: contact.id }
      );
    }
    console.log(pageOfContactsFromDB);
    if (pageOfContactsFromDB.length > 0) {
      pageNumber++;
      return await createExistingContacts(accessToken, pageNumber);
    } else {
      console.log("Done creating contacts");
      return;
    }
  } catch (err) {
    console.log(err);
  }
};

const createOrUpdateCompanies = async accessToken => {
  console.log("Creating or Updating Companies");
  try {
    const allFactions = await Faction.find({});
    for (const faction of allFactions) {
      const company = await axios.get(
        `http://hubspot_service:8080/api/companies/create-or-update/${faction.domain}/${accessToken}`
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("company", company.data);
    }
  } catch (err) {
    console.log(err.message);
  }
};

const initialSyncWithHubSpot = async accessToken => {
  await getAndSaveHubSpotContacts(accessToken);
  await setUpHubSpotProperties(accessToken);
  await updateExistingHubSpotContacts(accessToken, 0);
  await createExistingContacts(accessToken, 0);
  await createOrUpdateCompanies(accessToken);
};

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

    initialSyncWithHubSpot(accessToken);
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
  console.log(err.toString());
  res.status(500).send(err.toString());
});

console.log("process environment", process.env.NODE_ENV);
app.listen(process.env.PORT || 8080, () => {
  connectDb().then(() => {
    console.log("database connected");
  });
});
