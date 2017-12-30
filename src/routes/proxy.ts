import * as express from "express";
import * as request from "request";
import { URL } from "url";
import { BYP_ORIGIN_COOKIE, BYP_SUBMIT_MSG_COOKIE } from "../config";
import { logger } from "../logger";
import { isValidUrl } from "../utils";
import { redirectToSubmit } from "./utils";

function handleProxyRequest(req: express.Request, res: express.Response) {
  const originUrl = req.cookies[BYP_ORIGIN_COOKIE];
  if (!isValidUrl(originUrl)) {
    redirectToSubmit(req, res, "Invalid or missing origin URL. (Did you clear your cookies?)");
    return;
  }

  const targetUrl = originUrl + req.url;
  logger.info("Target URL: " + targetUrl);

  const requestOptions = getRequestOptions(req, res);
  const rq = request(targetUrl, requestOptions);
  rq.pipe(res);

  rq.on("response", (e) => {
    const contentType = e.headers["content-type"];
    if (!contentType) {
      return;
    }

    // charset stuff can be added to the end
    if (contentType.startsWith("text/html")) {
      // this can write a script onto the document
      // it could do some minor things to improve the experience from the user's end
      // it could also be used to mine cryptocurrency but i'm not that terrible (but its sorta enticing)
      // res.write("<script src='/_byp_script.js'></script>");
    }
  });

  rq.on("error", () => handleProxyError(req, res));
}

function getRequestOptions(req: express.Request, res: express.Response): request.CoreOptions {
  const requestOptions: request.CoreOptions = {};
  requestOptions.method = req.method;

  requestOptions.headers = {};
  requestOptions.headers["User-Agent"] = req.get("User-Agent");

  return requestOptions;
}

function handleProxyError(req: express.Request, res: express.Response) {
  redirectToSubmit(req, res, "Invalid URL");
}

const router = express.Router();

router.use((req, res) => handleProxyRequest(req, res));

export = router;
