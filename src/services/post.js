const { userService } = require(".");
const { Like, db } = require("../models");

const handleLikes = async (postId, userId) => {
  // Check if the like already exists
  const existingLike = await Like.findOne({
    where: {
      postId,
      userId,
    },
  });

  let like = null;
  let user = null;
  if (existingLike) {
    like = existingLike;
    // If the like exists, remove it
    await existingLike.destroy();
  } else {
    // If the like does not exist, create it
    like = await Like.create({
      postId,
      userId,
    });
  }
  user = await userService.getUserBId({
    where: {
      id: userId,
    },
    attributes: ["id", "username", "profile_url"],
  });

  const data = {
    liked: !existingLike,
    like,
    likedUser: user,
  };
  io.emit(`like-${postId}`, data);

  return data;
};

const handleComments = async (postId, userId, content) => {
  const commentData = { postId, content, userId };

  const comment = await db.Comment.create(commentData);
  const user = await userService.getUserBId({
    where: {
      id: userId,
    },
    attributes: ["id", "username", "profile_url"],
  });

  const data = {
    comment,
    commentedUser: user,
  };
  io.emit(`comment-${postId}`, data);
};

module.exports = { handleLikes, handleComments };
