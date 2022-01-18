//@ts-ignore
import { Server } from "http";
import { provide } from "inversify-binding-decorators";
import { IConnectedPlayer } from "../types/PlayerTypes";
import { GeckosPlayerHelper } from "./Geckos/GeckosPlayerHelper";

@provide(GeckosServerHelper)
export class GeckosServerHelper {
  constructor(private geckosPlayerHelper: GeckosPlayerHelper) {}

  public static connectedPlayers: IConnectedPlayer[] = [];

  public async init(httpServer: Server) {
    // import geckos as ESM
    const { geckos } = await import("@geckos.io/server");
    const io = geckos();
    io.listen(3000);
    io.addServer(httpServer);
    io.onConnection((channel) => {
      // bind events
      this.geckosPlayerHelper.bind(channel);
    });
  }
}
