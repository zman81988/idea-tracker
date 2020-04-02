const mongoose = require("mongoose");

const propertyHistorySchema = new mongoose.Schema({
  value: { type: String, default: "" },
  whenModified: { type: Date, default: Date.now() }
});

const userHistorySchema = new mongoose.Schema({
  firstNameHistory: [propertyHistorySchema],
  lastNameHistory: [propertyHistorySchema],
  rankHistory: [propertyHistorySchema],
  emailHistory: [propertyHistorySchema]
});

module.exports = userHistorySchema;
