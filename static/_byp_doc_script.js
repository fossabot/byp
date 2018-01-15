// Congrats. You found it.
// This site does inject a script into the document.

// This script does NOT steal your passwords or do anything nasty.
// It DOES provide some minor usability improvement features.

// By overriding certain objects (fetch, XMLHttpRequest, etc.) many more sites can be compatible.

// The source is here.
// You can read it for yourself.

/* jshint esversion: 3 */

(function () {
  "use strict";

  //
  // UTILS
  //

  function getFullPath(url) {
    return url.path + url.search + url.hash;
  }

  // Test if a URL is valid
  function isValidUrl(url) {
    // Try and create a URL object
    // If it TypeErrors we know it's invalid
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  function parseLink(url) {
    var link = window.document.createElement("a");
    link.href = link;
    return link;
  }

  //
  // LINK OVERWRITING
  //

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

      if (link.href.trim() === "" || link.href.trim().startsWith("#")) {
        // empty link or links to another element on page
        // either way we don't want to touch it
        return;
      }

      var href = link.protocol + link.host + getFullPath(link);
      // dirty parsing stuff
      var url = new URL(href);
      window.location = "/_byp/submit?url=" + url.href;
      return false;
    }
  }

  window.document.addEventListener("DOMContentLoaded", function () {
    var links = window.document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      link.addEventListener("click", onLinkClick, true);
    }
  });

  // //
  // // XMLHttpRequest Overwriting
  // //

  // // overwrite XMLHttpRequest to query our server for off site things
  // // this bypasses Access-Control-Allow-Origin stuff
  // function overwriteXMLHttpRequest() {
  //   var _open = window.XMLHttpRequest.prototype.open;
  //   window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
  //     // change URL to go to our server for cross origin things
  //     // if it is a valid URL on its own then rewrite it to go to our server
  //     if (isValidUrl(url)) {
  //       url = "/_byp/onefile?url=" + url;
  //     }

  //     return _open.call(this, method, url, async, user, password);
  //   };
  // }

  // if (window.XMLHttpRequest) {
  //   overwriteXMLHttpRequest();
  // }

  // //
  // // fetch Overwrite
  // //

  // function overwriteFetch() {
  //   var _fetch = window.fetch;
  //   window.fetch = function(url, options) {
  //     // see XMLHttpRequest overwrite for details
  //     // It's effectively the same thing
  //     if (isValidUrl(url)) {
  //       url = "/_byp/onefile?url=" + url;
  //     }

  //     return _fetch.call(this, url, options);
  //   };
  // }

  // if (window.fetch) {
  //   overwriteFetch();
  // }
}());
