import express from "express";
import { GeckosServerHelper } from "./libs/GeckosServerHelper";
import { serverRouter } from "./resources/server/server.routes";

const app = express();

const port = process.env.PORT || 5000;

// Middlewares ========================================

app.use(serverRouter);

const server = app.listen(port, () => {
  console.log(`⚙️ Server running on port ${port}`);

  const geckosServer = new GeckosServerHelper();
  geckosServer.init(server);
});
