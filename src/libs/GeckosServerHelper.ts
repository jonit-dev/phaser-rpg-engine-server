//@ts-ignore
import { ServerChannel } from "@geckos.io/server";
import { Server } from "http";
import { IConnectedPlayer } from "../types/PlayerTypes";
import { GeckosPlayerHelper } from "./Geckos/GeckosPlayerHelper";
import { MathHelper } from "./MathHelper";

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
      // bind events
      this.geckosPlayerHelper.bind(channel);
    });
  }

  private sendPrivateEvent(
    channelFrom: ServerChannel,
    channelToId: string,
    eventName: string,
    data: any
  ) {
    channelFrom.join(channelToId); // join private room
    console.log(channelToId);
    console.log(`sending event ${eventName} to ${channelFrom.roomId}`);
    channelFrom.room.emit(eventName, data); // send message
    channelFrom.join(undefined); // then go back to the default room (global)
  }

  private sendMessageToClosePlayers(
    channelFrom: ServerChannel,
    emitterId: any,
    eventName: string,
    data: any
  ) {
    const players = GeckosServerHelper.connectedPlayers;

    const emitterPlayer = players.find((player) => player.id === emitterId);
    const mathHelper = new MathHelper();

    if (!emitterPlayer) {
      console.log("Error: emitter player not found to calculate distance");
      return;
    }

    for (const player of players) {
      if (player === emitterPlayer) {
        continue; // avoid sending to self
      }

      // compare current position with emitter player position
      const distance = mathHelper.getDistanceBetweenPoints(
        emitterPlayer.x,
        emitterPlayer.y,
        player.x,
        player.y
      );

      const distanceThreshold = Math.floor(812 / 32);

      if (distance < distanceThreshold) {
        // camera viewpoint width

        console.log(
          `Emitter ${
            emitterPlayer.name
          } SENDING EVENT(${eventName}) to player ${
            player.name
          } that's on channel ${player.channelId} | distance: ${Math.floor(
            distance
          )} (threshold: ${distanceThreshold})`
        );

        this.sendPrivateEvent(channelFrom, player.channelId, eventName, data);
      }
    }
  }
}
