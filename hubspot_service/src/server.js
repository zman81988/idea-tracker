require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const hubspot = require("@hubspot/api-client");
const connectDb = require("./connection");
const app = express();
var apiRouter = express.Router();

app.use(bodyParser.json());

const { CLIENT_ID, BASE_URL, SCOPES, CLIENT_SECRET } = process.env;

const REDIRECT_URL = `${BASE_URL}/oauth/callback`;

const hubspotClient = new hubspot.Client();

apiRouter.get("/ping", (req, res) => {
  res.send("pong");
});

apiRouter.get("/contacts/:accessToken", async (req, res, next) => {
  const { accessToken } = req.params;
  hubspotClient.setAccessToken(accessToken);

  try {
    const getAllContacts = async (offset, startingContacts) => {
      const pageOfContacts = await hubspotClient.crm.contacts.basicApi.getPage(
        100,
        offset
      );
      // console.log(pageOfContacts.body.results);

      const endingContacts = startingContacts.concat(
        pageOfContacts.body.results
      );

      if (pageOfContacts.body.paging) {
        return await getAllContacts(
          pageOfContacts.body.paging.next.after,
          endingContacts
        );
      } else {
        return endingContacts;
      }
    };
    const allContacts = await getAllContacts(0, []);

    res.status(200).send(allContacts);
  } catch (err) {
    next(err);
  }
});

apiRouter.post("/contacts/create/:accessToken", async (req, res) => {
  // create contacts, will recieve in batches
});
apiRouter.post("/contacts/update/:accessToken", async (req, res) => {
  const { accessToken } = req.params;
  hubspotClient.setAccessToken(accessToken);
  const contactsToUpdate = req.body;
  const inputs = contactsToUpdate.map(contact => {
    return {
      id: contact.hubspotContactId,
      properties: {
        num_ideas_submitted: contact.numIdeasSubmitted,
        faction_rank: contact.rank
      }
    };
  });

  try {
    const updateResponse = await hubspotClient.crm.contacts.batchApi.updateBatch(
      { inputs }
    );
    console.log(updateResponse.body);
    res.send(updateResponse.body);
  } catch (err) {
    console.log(err.name);
  }
  // update contacts, will recieve in batches
});

apiRouter.get("/properties/:accessToken", async (req, res) => {
  const { accessToken } = req.params;
  hubspotClient.setAccessToken(accessToken);
  const createProperty = async groupName => {
    const inputs = [
      {
        groupName,
        type: "number",
        label: "Number of Ideas Submitted",
        fieldType: "number",
        name: "num_ideas_submitted"
      },
      {
        groupName,
        type: "string",
        label: "Faction Rank",
        fieldType: "string",
        name: "faction_rank"
      }
    ];
    try {
      return await hubspotClient.crm.properties.batchApi.createBatch(
        "contacts",
        {
          inputs
        }
      );
    } catch (err) {
      console.log(err.name);
    }
  };
  const propertyGroupInfo = {
    name: "ideatrackergroup",
    displayOrder: -1,
    label: "Idea Tracker Group"
  };
  try {
    const groupResponse = await hubspotClient.crm.properties.groupsApi.create(
      "contacts",
      propertyGroupInfo
    );
    console.log(groupResponse);
    const propertiesResponse = await createProperty(groupResponse.name);
    res.send(propertiesResponse);
  } catch (err) {
    if (err.name === "HttpError" && err.statusCode === 409) {
      const propertiesResponse = await createProperty(propertyGroupInfo.name);
      res.send(propertiesResponse);
    } else {
      //console.log(err);
    }
  }
});

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log("process environment", process.env.NODE_ENV);
app.listen(process.env.PORT || 8080, () => {
  connectDb().then(() => {
    console.log("database connected");
  });
});
