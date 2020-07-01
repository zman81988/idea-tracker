const mongoose = require("mongoose");

const propertyHistorySchema = new mongoose.Schema({
  value: { type: String, default: "" },
  whenModified: { type: Date, default: Date.now() },
});

const userHistorySchema = new mongoose.Schema({
  firstNameHistory: {
    type: [propertyHistorySchema],
    default: [{ value: "", whenModified: Date.now() }],
  },
  lastNameHistory: {
    type: [propertyHistorySchema],
    default: [{ value: "", whenModified: Date.now() }],
  },
  rankHistory: {
    type: [propertyHistorySchema],
    default: [{ value: "", whenModified: Date.now() }],
  },
  emailHistory: {
    type: [propertyHistorySchema],
    default: [{ value: "", whenModified: Date.now() }],
  },
});

module.exports = userHistorySchema;
