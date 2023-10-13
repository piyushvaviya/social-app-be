const express = require("express");
const auth = require("../middleware/auth");
// const { upload } = require("../middleware/uploadFile");
const { postController } = require("../controller");
const Uploader = require("../middleware/uploadFile");
const router = express.Router();

const upload = new Uploader("posts");

// Create a new post
router.post("/likes/:postId", auth, postController.likeHandler);
router.post("/", auth, upload.upload.single("file"), postController.createPost);

// Read all posts
router.get("/", auth, postController.getAllPosts);

// Read a single post by ID
router.get("/:id", auth, postController.getPostById);
// Route for adding a like to a post

// Update a post by ID
router.put("/:id", auth, postController.updatePost);

// Delete a post by ID
router.delete("/:id", auth, postController.deletePost);

module.exports = router;
