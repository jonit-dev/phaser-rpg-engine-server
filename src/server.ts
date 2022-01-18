import cors from "cors";
import express from "express";
import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import "reflect-metadata";
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

  const container = new Container();
  container.load(buildProviderModule());

  const geckosServer = container.get<GeckosServerHelper>(GeckosServerHelper);
  geckosServer.init(server);

  // const mapData = JSON.parse(
  //   fs.readFileSync(
  //     path.resolve(__dirname, "../public/maps/desert.json"),
  //     "utf8"
  //   )
  // );
  // const layer0Data = mapData.layers[0].data;

  // const tilemapParser = new TilemapParser();

  // const { x, y } = tilemapParser.getTileXY(104);
  // const tileId = tilemapParser.getTileId(x, y, layer0Data);

  // console.log(tileId);
});
