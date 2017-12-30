import winston = require("winston");
import { sync as mkdirp } from "mkdirp";

// load dailyroatefile
require("winston-daily-rotate-file");

// create the logs directory becuase winston is too much of a special snowflake to do it itself
mkdirp("logs");

export const logger = new winston.Logger({
  exitOnError: false,
  transports: [
    new winston.transports.DailyRotateFile({
      level: process.env.ENV === "development" ? "debug" : "info",
      filename: "./logs/log-",
      datePattern: "yyyy-MM-dd",
    }),
    new winston.transports.Console({
      level: "debug",
      json: false,
      colorize: true,
      timestamp: true,
    }),
  ],
});
