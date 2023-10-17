// postController.js

const httpStatus = require("http-status");
const { Post, db, Like } = require("../models"); // postController.js
const { validateValues } = require("../utils");
const { catchAsync } = require("../utils/catchAsync");
const { ApiError } = require("../utils/errorHandler");
const { NOT_FOUND } = require("../utils/messages");
const { successHandler } = require("../utils/response");
const { Op } = require("sequelize");
const { handleLikes } = require("../services/post");

const postQuery = {
  attributes: { exclude: ["updatedAt", "userId"] },
  include: [
    {
      model: db.Comment,
      as: "comments",
      attributes: { exclude: ["updatedAt", "userId", "postId"] },
      include: [
        {
          model: db.User,
          attributes: ["username", "profile_url", "id"],
          as: "user",
        },
      ],
    },
    {
      model: db.User,
      attributes: ["username", "profile_url", "id"],
      as: "user",
    },
    {
      attributes: { exclude: ["userId", "postId", "createdAt", "updatedAt"] },
      model: db.Like,
      as: "likes",
      include: [
        {
          model: db.User,
          attributes: ["username", "profile_url", "id"],
          as: "likes",
        },
      ],
    },
  ],
};

const createPost = catchAsync(async (req, res) => {
  const { title, content, location } = req.body;
  const { id } = req.user;

  const postData = { title, content };

  validateValues(postData);
  if (location !== "undefined") postData.location = location;
  postData.userId = id;

  if (!req?.file) {
    throw new ApiError("Please upload a file", httpStatus.BAD_REQUEST);
  }
  postData.post_url = `http://localhost:5433/assets/posts/${req?.file?.filename}`;

  const post = await Post.create(postData);

  successHandler(res, post, 201);
});

const getAllPosts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, allPosts, friendId } = req.query;
  const authUserId = req.user.id;

  const offset = (page - 1) * +limit;

  const posts = await Post.findAndCountAll({
    ...postQuery,
    where:
      allPosts === "true"
        ? {}
        : { userId: { [Op.eq]: friendId || authUserId } },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
  });

  const totalPages = Math.ceil(posts.count / +limit);

  const postRes = {
    totalPages,
    currentPage: page,
    posts,
  };

  successHandler(res, postRes);
});

const getPostById = catchAsync(async (req, res) => {
  const post = await Post.findByPk(req.params.id, postQuery);
  if (!post) {
    throw new ApiError(
      NOT_FOUND("Post", req.params.id),
      httpStatus.BAD_REQUEST
    );
  }

  successHandler(res, post);
});

const updatePost = catchAsync(async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    throw new ApiError(
      NOT_FOUND("Post", req.params.id),
      httpStatus.BAD_REQUEST
    );
  }
  const { title, content, location } = req.body;
  const postData = { title, content };

  validateValues(postData);

  post.title = title;
  post.content = content;
  post.location = location;

  await post.save();

  successHandler(res, post);
});

const deletePost = catchAsync(async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    throw new ApiError(
      NOT_FOUND("Post", req.params.id),
      httpStatus.BAD_REQUEST
    );
  }
  await post.destroy();
  successHandler(res, null, 200);
});

const likeHandler = catchAsync(async (req, res) => {
  const { postId } = req.params;
  console.log("🚀 ~ file: post.js:100 ~ likeHandler ~ postId:", postId);
  const userId = req.user.id;
  console.log("🚀 ~ file: post.js:102 ~ likeHandler ~ userId:", userId);

  // Check if the like already exists
  const data = await handleLikes(postId, userId);

  successHandler(res, data, 200);
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likeHandler,
};
