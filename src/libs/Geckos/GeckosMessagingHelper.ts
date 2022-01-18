//@ts-ignore
import { provide } from "inversify-binding-decorators";
import { GeckosServerHelper } from "../GeckosServerHelper";
import { MathHelper } from "../MathHelper";

@provide(GeckosMessagingHelper)
export class GeckosMessagingHelper {
  constructor(private mathHelper: MathHelper) {}

  public sendEventToUser(userChannel: string, eventName: string, data: any) {
    GeckosServerHelper.io.room(userChannel).emit(eventName, data);
  }

  public sendEventToAllUsers(eventName: string, data: any) {
    GeckosServerHelper.io.emit(eventName, data);
  }

  public sendMessageToClosePlayers(
    emitterId: any,
    eventName: string,
    data: any
  ) {
    const players = GeckosServerHelper.connectedPlayers;

    const emitterPlayer = players.find((player) => player.id === emitterId);

    if (!emitterPlayer) {
      console.log("Error: emitter player not found to calculate distance");
      return;
    }

    for (const player of players) {
      if (player.id === emitterPlayer.id) {
        continue; // avoid sending to self
      }
      console.log(`Checking ${player.name}...`);

      if (
        this.isUnderPlayerRange(
          emitterPlayer.x,
          emitterPlayer.y,
          player.x,
          player.y
        )
      ) {
        console.log(
          `Emitter ${emitterPlayer.name} SENDING EVENT(${eventName}) to player ${player.name} that's on channel ${player.channelId}`
        );

        // want near user about our emitter
        this.sendEventToUser(player.channelId, eventName, data);

        // and warn our emitter as well!
        this.sendEventToUser(emitterPlayer.channelId, eventName, {
          ...player,
        });
      }
    }
  }

  private isUnderPlayerRange(
    emitterX: number,
    emitterY: number,
    otherX: number,
    otherY: number
  ): boolean {
    // compare current position with emitter player position
    const distance = this.mathHelper.getDistanceBetweenPoints(
      emitterX,
      emitterY,
      otherX,
      otherY
    );

    const distanceThreshold = Math.floor(800);

    if (distance < distanceThreshold) {
      return true;
    }
    return false;
  }
}
