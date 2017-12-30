import * as express from "express";
import * as request from "request";
import { URL } from "url";
import { logger } from "./logger";

const BYP_ORIGIN_COOKIE = "_byp_origin";
const BYP_SUBMIT_MSG_COOKIE = "_byp_submit_msg";

function parseUrl(url: string): URL | null {
  try {
    const urlObj = new URL(url);
    return urlObj;
  } catch (e) {
    return null;
  }
}

function getFullPath(url: URL): string {
  return url.pathname + url.search + url.hash;
}

function isValidUrl(url: string): boolean {
  return !!parseUrl(url);
}

export class BypApp {
  constructor(app: express.Router) {
    app.get("/_byp_submit_url", (req, res) => this.renderSubmitPage(req, res));
    app.get("/_byp_submit_redirect", (req, res) => this.handleSubmitRedirect(req, res));
    app.get("/_byp_clear_cookies", (req, res) => this.handleClearCookies(req, res));

    app.all(/^.*$/, (req, res) => this.handleProxyRequest(req, res));
  }

  // PROXY

  private handleProxyRequest(req: express.Request, res: express.Response) {
    const originUrl = req.cookies[BYP_ORIGIN_COOKIE];
    if (!isValidUrl(originUrl)) {
      this.redirectToSubmit(req, res, "Invalid or missing origin URL. (Did you clear your cookies?)");
      return;
    }

    const targetUrl = originUrl + req.url;
    logger.info("Target URL: " + targetUrl);

    const requestOptions = this.getRequestOptions(req, res);
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

    rq.on("error", () => this.handleProxyError(req, res));
  }

  private getRequestOptions(req: express.Request, res: express.Response): request.CoreOptions {
    const requestOptions: request.CoreOptions = {};
    requestOptions.method = req.method;

    requestOptions.headers = {};
    requestOptions.headers["User-Agent"] = req.get("User-Agent");

    return requestOptions;
  }

  private handleProxyError(req: express.Request, res: express.Response) {
    this.redirectToSubmit(req, res, "Invalid URL");
  }

  // SUBMITTING

  private handleSubmitRedirect(req: express.Request, res: express.Response) {
    let rawUrl: string = req.query.url;
    if (!rawUrl) {
      this.redirectToSubmit(req, res, "Need to specify a URL");
      return;
    }

    // Make sure a protocol is defined
    if (!(rawUrl.startsWith("http:") || rawUrl.startsWith("https://"))) {
      rawUrl = "http://" + rawUrl;
    }

    const url = parseUrl(rawUrl);
    if (!url) {
      this.redirectToSubmit(req, res, "Invalid URL");
      return;
    }

    res.cookie(BYP_ORIGIN_COOKIE, url.origin, {
      httpOnly: true,
    });
    res.redirect(getFullPath(url));
  }

  private redirectToSubmit(req: express.Request, res: express.Response, msg: string = "") {
    res.cookie(BYP_SUBMIT_MSG_COOKIE, msg);
    res.redirect("/_byp_submit_url");
  }

  private renderSubmitPage(req: express.Request, res: express.Response) {
    const msg = req.cookies[BYP_SUBMIT_MSG_COOKIE] || "";
    this.clearCookies(req, res);
    res.render("submit", {
      msg,
    });
  }

  private clearCookies(req: express.Request, res: express.Response) {
    res.clearCookie(BYP_ORIGIN_COOKIE);
    res.clearCookie(BYP_SUBMIT_MSG_COOKIE);
  }

  private handleClearCookies(req: express.Request, res: express.Response) {
    this.clearCookies(req, res);
    this.redirectToSubmit(req, res, "Cookies cleared");
  }
}
