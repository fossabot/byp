import * as express from "express";
import * as request from "request";
import { URL } from "url";
import { BYP_ORIGIN_COOKIE, BYP_SUBMIT_MSG_COOKIE } from "../config";
import { logger } from "../logger";
import { redirectToSubmit, isValidUrl } from "./utils";

// Headers that we do NOT want to send in piped requests
const BLACKLISTED_HEADERS = [
  // can block sites from loading scripts on this domain
  // idea: send this header but also add in an exception for this site because we can manipulate all that
  "content-security-policy",

  // we manage our own hsts settings
  "strict-transport-security",

  // we send our own cache control settings
  "cache-control",
];

function handleProxyRequest(req: express.Request, res: express.Response) {
  const originUrl = req.cookies[BYP_ORIGIN_COOKIE];
  if (typeof originUrl !== "string" || !isValidUrl(originUrl)) {
    redirectToSubmit(req, res, "Invalid or missing origin URL. (Did you clear your cookies?)");
    return;
  }

  // remove cookies that are not the origin cookie
  for (const key of Object.keys(req.cookies)) {
    if (key !== BYP_ORIGIN_COOKIE) {
      res.clearCookie(key);
    }
  }

  const targetUrl = originUrl + req.url;
  logger.info("Target URL: " + targetUrl);

  // Make the request
  const requestOptions = getRequestOptions(req, res);
  const rq = request(targetUrl, requestOptions);

  // We don't use normal piping here in order to do a few more things you can't normally do.

  // Pipe data in chunks
  rq.on("data", (e) => {
    res.write(e);
  });

  // When the headers are recieved read them to figure things out
  // Determine content type to know if we should inject a script tag
  // Send headers
  let type: string = "";
  rq.on("response", (e) => {
    const contentType = e.headers["content-type"];
    if (!contentType) {
      return;
    }

    type = contentType.split(" ")[0].replace(/;/g, "");

    for (const key of Object.keys(e.headers)) {
      const val = e.headers[key];

      // send headers that aren't blacklisted
      if (BLACKLISTED_HEADERS.indexOf(key.toLowerCase()) === -1) {
        res.setHeader(key, val as string | string[]);
      }
    }
  });

  // when an error occurs that's bad
  rq.on("error", () => redirectToSubmit(req, res, "Error occurred"));

  // In order to inject our script into the document some terrible stuff is done
  // We override the end function to also write our script before ending.
  rq.on("end", () => {
    // Only inject our script if type is text/html
    // We don't want to inject it onto javascript or images because that breaks things
    if (type === "text/html") {
      res.write("<script src=\"/_byp/_doc_script.js\"></script>");
    }

    res.end();
  });

}

function getRequestOptions(req: express.Request, res: express.Response): request.CoreOptions {
  const requestOptions: request.CoreOptions = {};
  requestOptions.method = req.method;

  requestOptions.headers = {};
  // Send the same user agent as the browser
  // TODO: copy+paste more headers, maybe all headers but a few?
  requestOptions.headers["User-Agent"] = req.get("User-Agent");

  return requestOptions;
}

const router = express.Router();

// actually handle requests
router.use((req, res) => handleProxyRequest(req, res));

export = router;
