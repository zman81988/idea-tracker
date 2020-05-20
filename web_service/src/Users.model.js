const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userHistorySchema = require("./UserHistory.model");
const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    index: { unique: true },
  },
  password: {
    type: String,
  },
  numIdeasSubmitted: {
    type: Number,
  },
  numCommentsLeft: {
    type: Number,
  },
  signUpDate: {
    type: Date,
    default: Date.now(),
  },
  lastLoginDate: {
    type: Date,
    default: Date.now(),
  },
  numLogins: {
    type: Number,
    default: 1,
  },
  hubspotContactId: {
    type: String,
    index: true,
  },
  rank: {
    type: String,
  },
  propertyHistory: { type: userHistorySchema },
});

// add property history handling

const fieldsWithHistory = ["firstName", "lastName", "rank", "email"];

userSchema.pre("findOneAndUpdate", async function (next) {
  console.log("in find one and update hook");
  console.log("query update", this.getUpdate());
  const updatedUser = this.getUpdate();
  const currentUser = await this.model.findOne(this.getQuery());

  for (const field of fieldsWithHistory) {
    if (updatedUser[field]) {
      if (updatedUser[field] !== currentUser[field]) {
        updatedUser.propertyHistory = {
          ...updatedUser.propertyHistory,
          [`${field}History`]: [
            { value: updatedUser[field], whenModified: Date.now() },
            ...currentUser.propertyHistory[`${field}History`],
          ],
        };
      }
    }
    next();
  }
});

//http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
userSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return new Promise(async (resolve, reject) => {
    try {
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      resolve(isMatch);
    } catch (err) {
      reject(err);
    }
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
