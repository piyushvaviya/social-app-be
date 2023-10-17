const httpStatus = require("http-status");
const { ApiError } = require("../utils/errorHandler");
const { verifyToken } = require("../utils/jwt");
const { db } = require("../models");

module.exports = async (socket, next) => {
  try {
    let token = socket.handshake.query && socket.handshake.query.token;
    console.log("🚀 ~ file: socketAuth.js:7 ~ module.exports= ~ token:", token);
    // if (socket.handshake.query && socket.handshake.query.token) {
    //   jwt.verify(
    //     socket.handshake.query.token,
    //     "SECRET_KEY",
    //     function (err, decoded) {
    //       if (err) return next(new Error("Authentication error"));
    //       socket.decoded = decoded;
    //       next();
    //     }
    //   );
    // } else {
    //   next(new Error("Authentication error"));
    // }

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
    console.log("🚀 ~ file: socketAuth.js:39 ~ module.exports= ~ user:", user);

    if (!user) {
      return next(unAuthorizedError);
    }

    socket.decoded = decoded;
    next();
  } catch (err) {
    next(err);
  }
};
