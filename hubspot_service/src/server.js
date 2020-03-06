const express = require("express");
const bodyParser = require("body-parser");

const app = express();
var apiRouter = express.Router();

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

apiRouter.get("/properties/:accessToken", async (req, res, next) => {
  const { accessToken } = req.params;
  const propertyGroupInfo = {
    name: "ideatrackergroup",
    displayOrder: -1,
    label: "Idea Tracker Group"
  };
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
      next(err);
    }
  };
  hubspotClient.setAccessToken(accessToken);
  const checkForPropInfo = async () => {
    const existingPropertyGroups = await hubspotClient.crm.properties.groupsApi.getAll(
      "contacts"
    );

    const groupExists = existingPropertyGroups.body.results.find(
      group => group.name === propertyGroupInfo.name
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
      const existingProperties = allProperties.filter(property => {
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

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log("process environment", process.env.NODE_ENV);
app.listen(process.env.PORT || 8080, () => {});
