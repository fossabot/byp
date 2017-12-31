// use dotenv to load environment variables before anything else loads
import dotenv = require("dotenv");
dotenv.config();

import { logger } from "./logger";
import * as errorhandler from "errorhandler";

import { PORT } from "./config";
import { app } from "./app";

if (process.env.NODE_ENV !== "production") {
  app.use(errorhandler());
} else {
  app.use((req, res) => {
    res.status(500);
    res.send("500 Internal Server Error");
  });
}

// tell the server to start listening
const server = app.listen(PORT, () => {
  const address = server.address();
  logger.info(`listening on ${address.address}:${address.port}`);
});
