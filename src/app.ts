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

app.use(compression());
app.use(cookieParser());

app.use(express.static("static"));

app.use(BYP_API_ROUTE, require("./routes/byp"));
app.use(require("./routes/proxy"));
