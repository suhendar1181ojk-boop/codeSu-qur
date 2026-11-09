// Node.js, with nothing to install: node server.js
// Render, Railway, a VPS, or cPanel's "Setup Node.js App". PORT comes from the host.
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};
const hidden = new Set(["server.js", "package.json"]);

http
  .createServer((request, response) => {
    let url;
    try {
      url = decodeURIComponent((request.url || "/").split("?")[0]);
    } catch {
      response.writeHead(400);
      return response.end();
    }
    if (url.startsWith("/.well-known/")) url = "/well-known/" + url.slice("/.well-known/".length);
    if (url.endsWith("/")) url += "index.html";
    const file = path.normalize(path.join(root, url));
    if (!file.startsWith(root + path.sep) || hidden.has(path.basename(file))) {
      response.writeHead(404);
      return response.end("Not found");
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        return response.end("Not found");
      }
      const headers = { "content-type": types[path.extname(file)] || "application/octet-stream" };
      if (path.basename(file) === "sw.js") headers["cache-control"] = "no-cache";
      response.writeHead(200, headers);
      response.end(data);
    });
  })
  .listen(port, () => console.log("Running at http://localhost:" + port));
