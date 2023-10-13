require("dotenv").config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dbType: process.env.DB_TYPE,
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;
