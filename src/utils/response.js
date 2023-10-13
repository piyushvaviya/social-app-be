const successHandler = (res, data, status = 200, message = "") => {
  return res.status(status).json({
    success: true,
    data,
    ...(message && { message }),
  });
};

module.exports = { successHandler };
