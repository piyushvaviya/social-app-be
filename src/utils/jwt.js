const jwt = require("jsonwebtoken");
const config = require("../config/config");

const jwtSecret = config.jwtSecret;

const createToken = (payload) => {
  return jwt.sign(payload, jwtSecret);
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = { createToken, verifyToken };
