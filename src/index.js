require("dotenv").config();
const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const { connectToDb } = require("./db");
const appRouter = require("./routes");
const { errorHandler } = require("./utils/errorHandler");
const compression = require("compression");
const { NOT_FOUND } = require("./utils/messages");

const initializeServer = async () => {
  await connectToDb();

  const app = express();
  const port = config.port;

  app.use(cors());
  app.use(compression()); // compress all responses

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/v1", appRouter);

  app.listen(port, () => {
    console.log(`Server running successfully at ${port}`);
  });

  app.all("*", (req, res) => {
    res.status(404).json({
      message: NOT_FOUND("path", req.originalUrl),
    });
  });

  app.use(errorHandler);
};

initializeServer().catch(console.error);
