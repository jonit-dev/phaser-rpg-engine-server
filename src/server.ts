import cors from "cors";
import express from "express";
import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import "reflect-metadata";
import { GeckosServerHelper } from "./providers/geckos/GeckosServerHelper";
import { serverRouter } from "./useCases/ModuleSystem/server/read/server.routes";

const app = express();

const port = process.env.PORT || 5000;

// Middlewares ========================================

app.use(serverRouter);

app.use(cors());

// static public path
app.use(express.static("public"));

const server = app.listen(port, () => {
  console.log(`⚙️ Server running on port ${port}`);

  const container = new Container();
  container.load(buildProviderModule());

  const geckosServer = container.get<GeckosServerHelper>(GeckosServerHelper);
  geckosServer.init(server);
});
