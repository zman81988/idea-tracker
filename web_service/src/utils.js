const Account = require("./Accounts.model");

const hubspot = require("@hubspot/api-client");

const { CLIENT_ID, CLIENT_SECRET } = process.env;

const hubspotClient = new hubspot.Client();

module.exports = { hubspotClient };
