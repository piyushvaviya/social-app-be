const httpStatus = require("http-status");
const { Comment, db, Post } = require("../models");
const { validateValues } = require("../utils");
const { catchAsync } = require("../utils/catchAsync");
const { ApiError } = require("../utils/errorHandler");
const { NOT_FOUND } = require("../utils/messages");
const { successHandler } = require("../utils/response");

const createComment = catchAsync(async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const { id } = req.user;

  const post = await Post.findByPk(postId);
  if (!post) {
    throw new ApiError(NOT_FOUND("Post", postId), httpStatus.BAD_REQUEST);
  }

  validateValues({ content });
  const commentData = { postId, content, userId: id };

  const comment = await Comment.create(commentData);

  successHandler(res, comment, 201);
});

const getCommentsByPostId = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.findAll({
    where: { post: postId },
    // include: [{ model: db.User, attributes: ["username"] }],
  });

  successHandler(res, comments);
});

const deleteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    throw new ApiError(NOT_FOUND("Comment", commentId), httpStatus.BAD_REQUEST);
  }

  const postId = comment.postId;
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new ApiError(NOT_FOUND("Post", postId), httpStatus.BAD_REQUEST);
  }

  const commentIndex = post.comments.indexOf(commentId);
  if (commentIndex !== -1) {
    post.comments.splice(commentIndex, 1);
    await post.save();
  }

  await comment.destroy();
  successHandler(res, null, 204);
});

module.exports = {
  createComment,
  getCommentsByPostId,
  deleteComment,
};
