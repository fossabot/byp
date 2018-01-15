import * as express from "express";
import * as morgan from "morgan";
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as request from "request";
import * as url from "url";
import * as helmet from "helmet";

import { logger } from "./logger";
import { BYP_API_ROUTE } from "./config";

export const app = express();

app.set("trust proxy", true);
app.set("view engine", "pug");

// morgan for logging
app.use(morgan("short", {
  stream: {
    // pipe morgan writes to winston and remove trailing newline
    write: (m: string) => logger.info(m.replace(/\n$/, "")),
  },
}));

// helmet headers
// we don't want to enable too much otherwise sites will break
app.use(helmet.hidePoweredBy()); // not important
app.use(helmet.referrerPolicy()); // we don't want sites to see referred from us

// browsers love caching things even when cookies have pretty much changed entirely
// we have a legitimate reason to avoid caching
app.use(helmet.noCache());

// normal stuff
app.use(compression());
app.use(cookieParser());

// serves stuff from the static folder
app.use(express.static("static"));

// disable loading of favicon.ico
app.get("/favicon.ico", (req, res) => res.status(404).send("Favicon loading is blocked."));

// main API stuff
// submit page, redirect, etc
app.use(BYP_API_ROUTE, require("./routes/byp"));

// proxy requests
app.use(require("./routes/proxy"));
