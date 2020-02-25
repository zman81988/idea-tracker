const mongoose = require("mongoose");
const User = require("./Users.model");
const factionSchema = new mongoose.Schema({
  domain: {
    type: String,
    index: { unique: true }
  },
  hubspotCompanyId: {
    type: String
  },
  name: {
    type: String
  },
  members: [{ type: mongoose.ObjectId, ref: User }]
});
const Faction = mongoose.model("Faction", factionSchema);

module.exports = Faction;
