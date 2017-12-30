// CURRENTLY UNUSED

// Congrats. You found it.
// This site does inject a script into the body.
// It does put it before the doctype because I have no idea how else to do it.

// This script does NOT steal your passwords or do anything nasty.
// It DOES provide some minor usability improvement features.

// The source is here.
// You can read it for yourself.

/* jshint esversion: 3 */

(function () {
  "use strict";

  function parseLink(url) {
    var link = window.document.createElement("a");
    link.href = link;
    return link;
  }

  function onLinkClick(e) {
    var path = e.path;
    var link;
    for (var i = 0; i < path.length; i++) {
      if (path[i].tagName === "A") {
        link = path[i];
        break;
      }
    }
    if (link) {
      if (link.href === window.location.href) {
        // relative link, let it do normal things because it'll work
        return;
      }
      var href = link.protocol + link.host + link.pathname + link.search + link.hash;
      window.location = "/_byp_submit_redirect?url=" + href;
      return false;
    }
  }

  window.document.addEventListener("DOMContentLoaded", function () {
    var links = window.document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      link.onclick = onLinkClick;
    }
  });
}());
