const { verifyToken } = require("../utils/jwt");
const { ApiError } = require("../utils/errorHandler");
const { UNAUTHORIZED } = require("../utils/messages");
const httpStatus = require("http-status");
const { db } = require("../models");

module.exports = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    const unAuthorizedError = new ApiError(
      UNAUTHORIZED(),
      httpStatus.UNAUTHORIZED
    );

    if (!token) {
      return next(unAuthorizedError);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(unAuthorizedError);
    }

    const user = await db.User.findByPk(decoded.id);

    if (!user) {
      return next(unAuthorizedError);
    }

    req.user = user?.dataValues;
    next();
  } catch (err) {
    next(err);
  }
};
