const Account = require("./Accounts.model");

const hubspot = require("@hubspot/api-client");

const { CLIENT_ID, CLIENT_SECRET } = process.env;

const hubspotClient = new hubspot.Client();

const getAccessToken = async accountId => {
  try {
    const account = await Account.findOne({ accountId });
    const { expiresAt, accessToken } = account;
    if (Date(expiresAt) < Date.now()) {
      return accessToken;
    } else {
      const result = await hubspotClient.oauth.defaultApi.createToken(
        "refresh_token",
        undefined,
        undefined,
        CLIENT_ID,
        CLIENT_SECRET,
        account.refreshToken
      );
      console.log("result.body", result.body);
      const { accessToken, refreshToken, expiresIn } = result.body;
      console.log("expires_in", expiresIn);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresIn * 1000);
      console.log("expiresAt", expiresAt);
      account.accessToken = accessToken;
      account.refreshToken = refreshToken;
      account.expiresAt = expiresIn;
      await account.save();

      return accessToken;
    }
  } catch (err) {
    console.log(err);
  }
};

const fieldMapping = {
  firstname: "firstName",
  lastname: "lastName",
  faction_rank: "rank",
  email: "email"
};

module.exports = { getAccessToken, hubspotClient, fieldMapping };
