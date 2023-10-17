const express = require("express");
const { userController } = require("../controller");
const auth = require("../middleware/auth");
const Uploader = require("../middleware/uploadFile");
const router = express.Router();

const { upload } = new Uploader("user_profile");

router.post("/login", userController.login);
router.post("/register", upload.single("file"), userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/checkToken", auth, userController.checkToken);
router.get("/:userId", auth, userController.getUserById);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
