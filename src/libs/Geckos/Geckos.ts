//@ts-ignore
import { ServerChannel } from "@geckos.io/server";
import { GeckosServerHelper } from "../GeckosServerHelper";
import { MathHelper } from "../MathHelper";

export class Geckos {
  public sendPrivateEvent(
    channelFrom: ServerChannel,
    channelToId: string,
    eventName: string,
    data: any
  ) {
    channelFrom.join(channelToId); // join private room
    channelFrom.room.emit(eventName, data); // send message
    channelFrom.join(undefined); // then go back to the default room (global)
  }

  public sendMessageToClosePlayers(
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

      console.log(
        `Emitter => player ${player.id} distance: ${Math.floor(
          distance
        )} (threshold: ${distanceThreshold})`
      );

      if (distance < distanceThreshold) {
        // camera viewpoint width
        this.sendPrivateEvent(channelFrom, player.roomId, eventName, data);
      }
    }
  }
}
