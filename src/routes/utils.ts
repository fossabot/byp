import * as express from "express";
import { BYP_SUBMIT_MSG_COOKIE, BYP_API_ROUTE, BYP_ORIGIN_COOKIE } from "../config";
import { URL } from "url";

// PAGE UTILS

export function redirectToSubmit(req: express.Request, res: express.Response, msg: string = "") {
  res.cookie(BYP_SUBMIT_MSG_COOKIE, msg);
  res.redirect(BYP_API_ROUTE);
}

export function clearCookies(req: express.Request, res: express.Response) {
  res.clearCookie(BYP_ORIGIN_COOKIE);
  res.clearCookie(BYP_SUBMIT_MSG_COOKIE);
}

// URL PARSING

export function parseUrl(url: string): URL | null {
  try {
    const urlObj = new URL(url);
    return urlObj;
  } catch (e) {
    return null;
  }
}

export function getFullPath(url: URL): string {
  return url.pathname + url.search + url.hash;
}

export function isValidUrl(url: string): boolean {
  return !!parseUrl(url);
}
