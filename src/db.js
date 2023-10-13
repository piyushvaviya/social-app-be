const { Sequelize } = require("sequelize");
const config = require("./config/config");
const db = require("../models");

// Create a Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dbType,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const connectToDb = async () => {
  // Connect to the database
  await sequelize.authenticate();
  console.log("Connected to the database");

  // Sync the models with the database
  await sequelize.sync();
  console.log("Models synced with the database");

  return sequelize;
};

module.exports = { connectToDb, sequelize };
