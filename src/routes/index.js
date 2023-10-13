const express = require("express");
const userRoute = require("./user");
const postRoute = require("./post");
const commentRoute = require("./comment");

const router = express.Router();

const generalRoutes = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/posts",
    route: postRoute,
  },
  {
    path: "/comments",
    route: commentRoute,
  },
];

generalRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
