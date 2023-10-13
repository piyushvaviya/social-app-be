const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const httpStatus = require("http-status");
const { catchAsync } = require("../utils/catchAsync");
const { ApiError } = require("../utils/errorHandler");
const { validateValues } = require("../utils");
const { successHandler } = require("../utils/response");
const { db } = require("../models");
const { NOT_FOUND, ALREADY_EXISTS, NOT_VALID } = require("../utils/messages");
const { createToken } = require("../utils/jwt");

// login user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("🚀 ~ file: user.js:15 ~ login ~ email:", email);
  validateValues({ email, password });

  const user = await db.User.findOne({
    where: {
      email,
    },
  });
  console.log("🚀 ~ file: user.js:23 ~ login ~ user:", user);

  if (!user)
    return next(new ApiError(NOT_VALID("credentials"), httpStatus.BAD_REQUEST));

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ApiError(`Invalid credentials`, 400));
  }
  console.log(
    "🚀 ~ file: user.js:36 ~ login ~ user?.dataValues?._id:",
    user?.dataValues?.id
  );

  const accessToken = createToken({
    id: user?.dataValues?.id,
  });

  successHandler(res, { user, accessToken });
});

// Create a new user
const createUser = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;
  const profile_url = req?.file?.path;
  console.log("🚀 ~ file: user.js:14 ~ createUser ~ username:", username);
  // Validate input data
  validateValues({ username, email, password });

  const existingUser = await db.User.findOne({
    where: {
      [Sequelize.Op.or]: [{ username }, { email }],
    },
  });
  console.log(
    "🚀 ~ file: user.js:57 ~ createUser ~ existingUser:",
    existingUser
  );

  if (existingUser) {
    const existingField =
      existingUser.username === username ? "username" : "email";

    throw new ApiError(
      ALREADY_EXISTS("User", existingField),
      httpStatus.BAD_REQUEST
    );
  }

  // Create the user
  const user = await db.User.create({
    username,
    email,
    password,
    profile_url,
  });

  successHandler(res, user, httpStatus.CREATED);
});

// Get all users
const getAllUsers = catchAsync(async (req, res) => {
  const users = await db.User.findAll();

  successHandler(res, users);
});

// Get a single user by ID
const getUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new ApiError(NOT_FOUND("User", userId));
  }

  successHandler(res, user);
});

// Update a user by ID
const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { username, email, password } = req.body;

  // Validate input data
  validateValues({ username, email, password });

  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new ApiError(NOT_FOUND("User", userId));
  }

  user.username = username;
  user.email = email;
  user.password = password;

  await user.save();

  successHandler(res, user);
});

// Delete a user by ID
const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new ApiError(NOT_FOUND("User", userId));
  }

  await user.destroy();

  successHandler(res, {}, httpStatus.NO_CONTENT);
});

module.exports = {
  login,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
