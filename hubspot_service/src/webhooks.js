const express = require("express");
const kafka = require("kafka-node");

const { KAFKA_BROKER_LIST } = process.env;
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: KAFKA_BROKER_LIST });
const producer = new Producer(client);
const admin = new kafka.Admin(client);

const TOPICS = [
  {
    topic: "contact.propertyChange",
    partitions: 1,
    replicationFactor: 1
  }
];

producer.on("ready", () => {
  console.log("kafka produce is ready");
  admin.createTopics(TOPICS, (err, res) => {
    console.log(res);
  });
});

const webhookRouter = express.Router();

webhookRouter.post("/platform", (req, res, next) => {
  res.send("Ok");
});

module.exports = webhookRouter;
