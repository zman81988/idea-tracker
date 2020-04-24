const express = require("express");
const bodyParser = require("body-parser");
const hubspot = require("@hubspot/api-client");
const webhookRouter = require("./webhooks");

const app = express();
const apiRouter = express.Router();

app.use(bodyParser.json());

const hubspotClient = new hubspot.Client();

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

apiRouter.post("/contacts/create/:accessToken", async (req, res, next) => {
  const { accessToken } = req.params;
  hubspotClient.setAccessToken(accessToken);
  const contactsToCreate = req.body;
  const inputs = contactsToCreate.map((contact) => {
    return {
      properties: {
        num_ideas_submitted: contact.numIdeasSubmitted,
        faction_rank: contact.rank,
        email: contact.email,
        firstname: contact.firstName,
        lastname: contact.lastName,
      },
    };
  });
  try {
    const createResponse = await hubspotClient.crm.contacts.batchApi.createBatch(
      { inputs }
    );
    console.log(createResponse.body);
    res.send(createResponse.body);
  } catch (err) {
    next(err);
  }
});
apiRouter.post("/contacts/update/:accessToken", async (req, res, next) => {
  const { accessToken } = req.params;
  hubspotClient.setAccessToken(accessToken);
  const contactsToUpdate = req.body;
  const inputs = contactsToUpdate.map((contact) => {
    return {
      id: contact.hubspotContactId,
      properties: {
        num_ideas_submitted: contact.numIdeasSubmitted,
        faction_rank: contact.rank,
      },
    };
  });

  try {
    const updateResponse = await hubspotClient.crm.contacts.batchApi.updateBatch(
      { inputs }
    );
    console.log(updateResponse.body);
    res.send(updateResponse.body);
  } catch (err) {
    next(err);
  }
});

apiRouter.put("/contacts/update-one/:accessToken", async (req, res, next) => {
  const { accessToken } = req.params;
  hubspotClient.setAccessToken(accessToken);
  const contactToUpdate = req.body;
  try {
    console.log("will attempt to update", contactToUpdate);
    res.send("Ok");
  } catch (err) {
    next(err);
  }
});

apiRouter.get(
  "/companies/create-or-update/:faction/:accessToken",
  async (req, res, next) => {
    const { faction, accessToken } = req.params;
    hubspotClient.setAccessToken(accessToken);
    const searchCriteria = {
      filterGroups: [
        {
          filters: [{ propertyName: "domain", operator: "EQ", value: faction }],
        },
      ],
    };
    try {
      const companiesByDomain = await hubspotClient.crm.companies.searchApi.doSearch(
        searchCriteria
      );
      if (companiesByDomain.body.results.length > 0) {
        res.send(companiesByDomain.body.results[0]);
      } else {
        const newCompany = await hubspotClient.crm.companies.basicApi.create({
          properties: { domain: faction },
        });
        res.send(newCompany.body);
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

apiRouter.get("/properties/:accessToken", async (req, res, next) => {
  const { accessToken } = req.params;
  const propertyGroupInfo = {
    name: "ideatrackergroup",
    displayOrder: -1,
    label: "Idea Tracker Group",
  };
  const createProperty = async (groupName) => {
    const inputs = [
      {
        groupName,
        type: "number",
        label: "Number of Ideas Submitted",
        fieldType: "number",
        name: "num_ideas_submitted",
      },
      {
        groupName,
        type: "string",
        label: "Faction Rank",
        fieldType: "string",
        name: "faction_rank",
      },
    ];
    try {
      return await hubspotClient.crm.properties.batchApi.createBatch(
        "contacts",
        {
          inputs,
        }
      );
    } catch (err) {
      next(err);
    }
  };
  hubspotClient.setAccessToken(accessToken);
  const checkForPropInfo = async () => {
    const existingPropertyGroups = await hubspotClient.crm.properties.groupsApi.getAll(
      "contacts"
    );

    const groupExists = existingPropertyGroups.body.results.find(
      (group) => group.name === propertyGroupInfo.name
    );
    if (groupExists) {
      const getAllExistingProperties = async (startingProperties, offset) => {
        const pageOfProperties = await hubspotClient.crm.properties.coreApi.getAll(
          "contacts",
          false,
          { offset }
        );
        const endingProperties = startingProperties.concat(
          pageOfProperties.body.results
        );
        if (pageOfProperties.body.paging) {
          return await getAllExistingProperties(
            endingProperties,
            pageOfProperties.body.page.next.after
          );
        } else return endingProperties;
      };
      const allProperties = await getAllExistingProperties([], 0);
      const existingProperties = allProperties.filter((property) => {
        property.name === "faction_rank" ||
          property.name === "num_ideas_submitted";
      });
      console.log(existingProperties);
      if (existingProperties.length === 0) {
        await createProperty(propertyGroupInfo.name);
        res.send("Properties Created");
      } else {
        res.send("Properties Already Existed");
      }
    } else {
      try {
        const groupResponse = await hubspotClient.crm.properties.groupsApi.create(
          "contacts",
          propertyGroupInfo
        );
        const propertiesResponse = await createProperty(propertyGroupInfo.name);
        res.send(propertiesResponse);
      } catch (err) {
        next(err);
      }
    }
  };

  checkForPropInfo();
});

apiRouter.post("/timeline/:accessToken", async (req, res, next) => {
  const { idea } = req.body;
  const { accessToken } = req.params;
  hubspotClient.setAccessToken(accessToken);
  const timelineEvent = {
    eventTemplateId: "1003035",
    objectId: idea.author.hubspotContactId,
    tokens: {
      idea_title: idea.title,
      idea_detail: idea.detail,
    },
  };
  console.log("sending timeline event", timelineEvent);
  try {
    console.log(hubspotClient.crm);
    await hubspotClient.crm.timeline.eventsApi.create(timelineEvent);
  } catch (err) {
    next(err);
  }
});

app.use("/api", apiRouter);

app.use("/webhook", webhookRouter);

app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log("process environment", process.env.NODE_ENV);
app.listen(process.env.PORT || 8080, () => {});
