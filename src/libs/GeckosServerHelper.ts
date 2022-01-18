//@ts-ignore
import { GeckosServer } from "@geckos.io/server";
import { Server } from "http";
import { provide } from "inversify-binding-decorators";
import { IConnectedPlayer } from "../types/PlayerTypes";
import { GeckosPlayerHelper } from "./Geckos/GeckosPlayerHelper";

@provide(GeckosServerHelper)
export class GeckosServerHelper {
  public static io: GeckosServer;

  constructor(private geckosPlayerHelper: GeckosPlayerHelper) {}

  public static connectedPlayers: IConnectedPlayer[] = [];

  public async init(httpServer: Server) {
    // import geckos as ESM
    const { geckos } = await import("@geckos.io/server");
    GeckosServerHelper.io = geckos();
    GeckosServerHelper.io.listen(3000);
    GeckosServerHelper.io.addServer(httpServer);
    GeckosServerHelper.io.onConnection((channel) => {
      // bind events
      this.geckosPlayerHelper.bind(channel);
    });
  }
}
