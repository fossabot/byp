import * as express from "express";
import { BYP_ORIGIN_COOKIE, BYP_SUBMIT_MSG_COOKIE } from "../config";
import { parseUrl, getFullPath } from "../utils";
import { redirectToSubmit, clearCookies } from "./utils";

function renderSubmitPage(req: express.Request, res: express.Response) {
  const msg = req.cookies[BYP_SUBMIT_MSG_COOKIE] || "";
  clearCookies(req, res);
  res.render("submit", {
    msg,
  });
}

function handleSubmit(req: express.Request, res: express.Response) {
  let rawUrl: string = req.query.url;
  if (!rawUrl) {
    redirectToSubmit(req, res, "Need to specify a URL");
    return;
  }

  // Make sure a protocol is defined
  if (!(rawUrl.startsWith("http:") || rawUrl.startsWith("https://"))) {
    rawUrl = "http://" + rawUrl;
  }

  const url = parseUrl(rawUrl);
  if (!url) {
    redirectToSubmit(req, res, "Invalid URL");
    return;
  }

  res.cookie(BYP_ORIGIN_COOKIE, url.origin, {
    httpOnly: true,
  });
  res.redirect(getFullPath(url));
}

function handleClearCookies(req: express.Request, res: express.Response) {
  clearCookies(req, res);
  redirectToSubmit(req, res, "Cookies cleared");
}

const router = express.Router();

router.get("/", (req, res) => renderSubmitPage(req, res));
router.get("/submit", (req, res) => handleSubmit(req, res));
router.get("/clearcookies", (req, res) => handleClearCookies(req, res));

export = router;
