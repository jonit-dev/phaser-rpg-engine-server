import cors from "cors";
import express from "express";
import { GeckosServerHelper } from "./libs/GeckosServerHelper";
import { serverRouter } from "./resources/server/server.routes";

const app = express();

const port = process.env.PORT || 5000;

// Middlewares ========================================

app.use(serverRouter);

app.use(cors());

// static public path
app.use(express.static("public"));

const server = app.listen(port, () => {
  console.log(`⚙️ Server running on port ${port}`);

  const geckosServer = new GeckosServerHelper();
  geckosServer.init(server);
});
