const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT ?? 3001);
const publicDir = path.join(__dirname, "public");

const contentTypeByExt = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function safePathFromUrl(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const cleaned = decoded.split("?")[0].split("#")[0];
  const rel = cleaned === "/" ? "/index.html" : cleaned;
  const abs = path.join(publicDir, rel);
  const normalized = path.normalize(abs);
  if (!normalized.startsWith(publicDir)) return null;
  return normalized;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
  const filePath = safePathFromUrl(url.pathname);

  if (!filePath) {
    res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  fs.readFile(filePath, (err, buf) => {
    if (err) {
      // Fallback: single-page apps / simple routing -> serve index.html
      if (err.code === "ENOENT" && url.pathname !== "/index.html") {
        fs.readFile(path.join(publicDir, "index.html"), (err2, buf2) => {
          if (err2) {
            res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
            res.end("Not Found");
            return;
          }
          res.writeHead(200, { "content-type": contentTypeByExt[".html"] });
          res.end(buf2);
        });
        return;
      }

      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypeByExt[ext] ?? "application/octet-stream";
    res.writeHead(200, { "content-type": contentType });
    res.end(buf);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
