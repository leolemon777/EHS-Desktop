import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const host = "127.0.0.1";
const port = Number(process.argv[2] || process.env.EHS_PORT || 4179);
const root = process.cwd();
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
    const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(root, safePath === "/" ? "index.html" : safePath);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = join(filePath, "index.html");
    const content = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("404 - File not found");
  }
}).listen(port, host, () => {
  console.log(`Halo EHS is running at http://${host}:${port}`);
});
