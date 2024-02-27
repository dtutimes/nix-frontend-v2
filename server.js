import express from "express";
import path from "path";
const server = express();

const __dirname = path.resolve(path.dirname(""));

server.use("/public", express.static("/public"));

server.get("/assets/*", (req, res) => {
  const addr = req.params[0];
  if (!addr) {
    return res.status(404).send("Not found");
  }
  const path_addr = path.join(__dirname, "/dist/assets/", addr);
  res.sendFile(path_addr);
});

server.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

const port = 5173;
server.listen(port, function () {
  console.debug("Server listening on port " + port);
});