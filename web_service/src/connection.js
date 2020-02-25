// connection.js
const mongoose = require("mongoose");
const connection = "mongodb://mongo:27017/idea-tracker";
const connectDb = () => {
  return mongoose.connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
};
module.exports = connectDb;
