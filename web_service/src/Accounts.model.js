const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  accountId: {
    type: Number,
    index: { unique: true }
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  expiresAt: {
    type: Date
  }
});
const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
