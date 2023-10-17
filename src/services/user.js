const { db } = require("../models");

const getUserBId = (query) => {
  return db.User.findOne(query);
};

module.exports = { getUserBId };
