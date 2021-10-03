import http from "http";

// server is needed to keep replit alive
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Ah, ha, ha, ha, stayin' alive");
});

server.listen(process.env.PORT || 8080);
