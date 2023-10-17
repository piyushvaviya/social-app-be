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

const userQuery = {
  include: [
    {
      model: db.Post,
      attributes: [],
      as: "Posts", // Updated alias to match the association
      duplicating: false,
    },
  ],
  attributes: {
    include: [
      [db.sequelize.fn("COUNT", db.sequelize.col("Posts.id")), "postCount"],
    ], // Updated alias to match the association
  },
  group: ["User.id"],
};

// login user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("🚀 ~ file: user.js:15 ~ login ~ email:", email);
  validateValues({ email, password });

  const user = await db.User.findOne({
    where: {
      email,
    },
    ...userQuery,
  });
  console.log("🚀 ~ file: user.js:23 ~ login ~ user:", user);

  if (!user)
    return next(new ApiError(NOT_VALID("credentials"), httpStatus.BAD_REQUEST));

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ApiError(`Invalid credentials`, 400));
  }

  const accessToken = createToken({
    id: user?.dataValues?.id,
  });

  delete user.dataValues.password;
  console.log("🚀 ~ file: user.js:43 ~ login ~ user:", user);

  successHandler(res, { user, accessToken });
});

const checkToken = catchAsync(async (req, res) => {
  successHandler(res, null);
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

  const user = await db.User.findOne({
    where: {
      id: userId,
    },
    ...userQuery,
  });

  if (!user) {
    throw new ApiError(NOT_FOUND("User", userId), httpStatus.BAD_REQUEST);
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
  checkToken,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
