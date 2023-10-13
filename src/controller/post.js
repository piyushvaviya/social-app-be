// postController.js

const httpStatus = require("http-status");
const { Post, db, Like } = require("../models"); // postController.js
const { validateValues } = require("../utils");
const { catchAsync } = require("../utils/catchAsync");
const { ApiError } = require("../utils/errorHandler");
const { NOT_FOUND } = require("../utils/messages");
const { successHandler } = require("../utils/response");
const { Op } = require("sequelize");

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
  const { title, content } = req.body;
  const { id } = req.user;

  const postData = { title, content };

  validateValues(postData);
  postData.userId = id;
  postData.post_url = req?.file?.path;

  const post = await Post.create(postData);

  successHandler(res, post, 201);
});

const getAllPosts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  const offset = (page - 1) * limit;

  const posts = await Post.findAndCountAll({
    ...postQuery,
    where: { userId: { [Op.eq]: userId } },
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const totalPages = Math.ceil(posts.count / limit);

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
  const { title, content } = req.body;
  post.title = title;
  post.content = content;

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
  successHandler(res, null, 204);
});

const likeHandler = catchAsync(async (req, res) => {
  const { postId } = req.params;
  console.log("🚀 ~ file: post.js:100 ~ likeHandler ~ postId:", postId);
  const userId = req.user.id;
  console.log("🚀 ~ file: post.js:102 ~ likeHandler ~ userId:", userId);

  // Check if the like already exists
  const existingLike = await Like.findOne({
    where: {
      postId,
      userId,
    },
  });
  console.log(
    "🚀 ~ file: post.js:111 ~ likeHandler ~ existingLike:",
    existingLike
  );

  if (existingLike) {
    // If the like exists, remove it
    await existingLike.destroy();

    // res.status(200).json({ message: "Like removed successfully" });
  } else {
    // If the like does not exist, create it
    const newLike = await Like.create({
      postId,
      userId,
    });

    // res.status(201).json({ like: newLike, message: "Like created" });
  }
  // Find the post by postId
  //   const post = await Post.findByPk(postId);

  //   if (!post) {
  //     throw new ApiError(NOT_FOUND("Post", postId), httpStatus.BAD_REQUEST);
  //   }

  //   const likes = post.likes || post?.dataValues?.likes || [];
  //   const isUserAlreadyLiked = likes.includes(userId);

  //   if (isUserAlreadyLiked) {
  //     // Remove the user's userId from the likes array
  //     await Post.update(
  //       {
  //         likes: db.sequelize.literal(`ARRAY_REMOVE(likes, ${userId})`),
  //       },
  //       { where: { id: postId } }
  //     );
  //   } else {
  //     // Add the user's userId to the likes array
  //     await Post.update(
  //       {
  //         likes: db.sequelize.literal(`ARRAY_APPEND(likes, ${userId})`),
  //       },
  //       { where: { id: postId } }
  //     );
  //   }

  successHandler(res, { isUserExist: !existingLike }, 204);
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likeHandler,
};
