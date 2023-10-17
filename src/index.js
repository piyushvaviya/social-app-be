require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const wildCardSocket = require("socketio-wildcard");
const cors = require("cors");
const config = require("./config/config");
const { connectToDb } = require("./db");
const appRouter = require("./routes");
const { errorHandler } = require("./utils/errorHandler");
const compression = require("compression");
const { NOT_FOUND } = require("./utils/messages");
const { handleLikes, handleComments } = require("./services/post");
// const socketAuth = require("./middleware/socketAuth");

const initializeServer = async () => {
  await connectToDb();

  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // io.use(async (socket, next) => await socketAuth(socket, next));

  io.use(wildCardSocket());

  const connectedUser = {};
  let onlineUsers = {};

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    // add new user
    socket.on("new-user-add", (newUserId) => {
      if (!onlineUsers[newUserId]) {
        onlineUsers[newUserId] = { userId: newUserId, socketId: socket.id };
        onlineUsers[socket.id] = { userId: newUserId, socketId: socket.id };
        console.log("new user is here!", onlineUsers);
      }

      // // send all active users to new user
      io.emit("get-users", onlineUsers);
    });

    socket.on("login", (data) => {
      connectedUser[+data?.user?.id] = data?.user;
    });

    socket.on("logout", (userId) => {
      delete connectedUser[userId];
    });

    socket.on("offline", () => {
      const user = onlineUsers[socket.id]?.userId;
      delete onlineUsers[socket.id];
      delete onlineUsers[user];

      // send all online users to all users
      io.emit("get-users", onlineUsers);
    });

    socket.on("disconnect", () => {
      const user = onlineUsers[socket.id]?.userId;
      delete onlineUsers[socket.id];
      delete onlineUsers[user];

      // send all online users to all users
      io.emit("get-users", onlineUsers);
      console.log("user disconnected", socket.id);
    });

    socket.on("*", async (emitData) => {
      const { data } = emitData;
      // console.log("🚀 ~ file: index.js:39 ~ socket.on ~ data:", data);
      const eventName = data[0] || "";
      const eventData = data[1] || {};
      // console.log("🚀 ~ file: index.js:40 ~ socket.on ~ eventName:", eventName);

      const isLikeEvent = !!eventName.match(/^like-/)?.length;
      const isCommentEvent = !!eventName.match(/^comment-/)?.length;
      // const isLogoutEvent = !!eventName.match(/^logout-/)?.length;
      // const isLoginEvent = !!eventName.match(/^login-/)?.length;

      if (isLikeEvent) {
        const [_, postId, userId] = eventName.split("-");
        handleLikes(postId, userId).catch(console.error);
      } else if (isCommentEvent) {
        const [_, postId, userId] = eventName.split("-");
        handleComments(postId, userId, eventData?.commentValue).catch(
          console.error
        );
      }
    });
  });

  global.io = io;
  const port = config.port;

  app.use(cors());
  app.use(compression()); // compress all responses

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(express.static(__dirname + "/assets"));
  app.use("/assets", express.static("assets"));

  app.use("/v1", appRouter);

  app.all("*", (req, res) => {
    res.status(404).json({
      message: NOT_FOUND("path", req.originalUrl),
    });
  });

  app.use(errorHandler);

  server.listen(port, () => {
    console.log(`Server running successfully at ${port}`);
  });
};

initializeServer().catch(console.error);
