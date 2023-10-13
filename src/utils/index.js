const httpStatus = require("http-status");
const { ApiError } = require("./errorHandler");
const { NOT_VALID } = require("./messages");

const validateValues = (data) => {
  for (const arg of Object.keys(data)) {
    if (!data?.[arg]?.trim?.()?.length)
      throw new ApiError(NOT_VALID(arg), httpStatus.BAD_REQUEST);
  }

  return true;
};

module.exports = {
  validateValues,
};
