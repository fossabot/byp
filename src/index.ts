// use dotenv to load environment variables before anything else loads
import dotenv = require("dotenv");
dotenv.config();

import { logger } from "./logger";
import * as errorhandler from "errorhandler";

import { PORT } from "./config";
import { app } from "./app";

logger.info("Started!");

if (process.env.NODE_ENV !== "production") {
  app.use(errorhandler());
}

// tell the server to start listening
const server = app.listen(PORT, () => {
  const address = server.address();
  logger.info(`listening on ${address.address}:${address.port}`);
});
