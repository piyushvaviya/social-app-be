const express = require("express");
const { commentController } = require("../controller");
const auth = require("../middleware/auth");

const router = express.Router();

// Comment routes
router.post("/:postId", auth, commentController.createComment);
router.get("/:postId", auth, commentController.getCommentsByPostId);
router.delete("/:commentId", auth, commentController.deleteComment);

module.exports = router;
