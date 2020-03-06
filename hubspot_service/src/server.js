const express = require("express");
const bodyParser = require("body-parser");

const app = express();
var apiRouter = express.Router();

app.use(bodyParser.json());

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log("process environment", process.env.NODE_ENV);
app.listen(process.env.PORT || 8080, () => {});
