const Users = require("./Users.model");
const { fieldMapping } = require("./utils");

const userHandler = async message => {
  const event = JSON.parse(message.value);
  const {
    propertyValue,
    propertyName,
    occurredAt,
    objectId,
    changeSource
  } = event;
  if (changeSource === "API") return;

  try {
    const user = await Users.findOne({ hubspotContactId: objectId });
    if (user) {
      console.log("propertyName", propertyName);
      const fieldToCheck = fieldMapping[propertyName];
      console.log("fieldToCheck", fieldToCheck);
      if (fieldToCheck) {
        if (user[fieldToCheck] !== propertyValue) {
          //check history
          console.log(
            "whenmodifed",
            user.propertyHistory[`${fieldToCheck}History`][0].whenModified
          );
          console.log("occurredAt", occurredAt);
          const lastModifiedFromDB = Date.parse(
            user.propertyHistory[`${fieldToCheck}History`][0].whenModified
          );
          const lastModifiedFromHS = Date.parse(occurredAt);
          if (lastModifiedFromDB < lastModifiedFromHS) {
            user[fieldToCheck] = propertyValue;
            await user.save();
          } else {
            console.log("field value is less current that what is saved");
          }
        } else {
          console.log("field values already match");
        }
      } else {
        console.log("Not a mapped property");
      }
    } else {
      console.log("Does not exist in database, ignoring");
    }
  } catch (err) {
    console.log(err);
  }

  // If they are different, check to see if this is more recent information, then apply
};

module.exports = userHandler;
