import * as express from "express";
import * as morgan from "morgan";
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as request from "request";
import * as url from "url";

import { logger } from "./logger";
import { BYP_API_ROUTE } from "./config";

export const app = express();

app.set("trust proxy", true);
app.set("view engine", "pug");

app.use(morgan("short", {
  stream: {
    write: (m: string) => logger.info(m.replace(/\n$/, "")),
  },
}));
app.use(compression());
app.use(cookieParser());

app.use(express.static("static"));

app.use(BYP_API_ROUTE, require("./routes/byp"));
app.use(require("./routes/proxy"));
