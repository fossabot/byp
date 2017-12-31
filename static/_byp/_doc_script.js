// Congrats. You found it.
// This site does inject a script into the document.

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
      if (link.host === window.location.host) {
        // relative link, let it do normal things because it'll work
        return;
      }
      var href = link.protocol + link.host + link.pathname + link.search + link.hash;
      window.location = "/_byp/submit?url=" + href;
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
