const db = require("../../models");

const Post = db.Post;
const Comment = db.Comment;
const Like = db.Like;

module.exports = {
  db,
  Post,
  Comment,
  Like,
};
