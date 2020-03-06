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

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log("process environment", process.env.NODE_ENV);
app.listen(process.env.PORT || 8080, () => {});
