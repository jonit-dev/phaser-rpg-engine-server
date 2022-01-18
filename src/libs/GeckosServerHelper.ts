import { Server } from "http";
import { IConnectedPlayer } from "../types/PlayerTypes";
import { GeckosPlayerHelper } from "./Geckos/GeckosPlayerHelper";

export class GeckosServerHelper {
  private geckosPlayerHelper: GeckosPlayerHelper;

  constructor() {
    this.geckosPlayerHelper = new GeckosPlayerHelper();
  }

  public static connectedPlayers: IConnectedPlayer[] = [];

  public async init(httpServer: Server) {
    // import geckos as ESM
    const { geckos } = await import("@geckos.io/server");
    const io = geckos();
    io.listen(3000);

    io.addServer(httpServer);

    io.onConnection((channel) => {
      this.geckosPlayerHelper.bind(channel);
    });
  }
}
