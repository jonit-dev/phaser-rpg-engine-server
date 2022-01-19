//@ts-ignore
import { provide } from "inversify-binding-decorators";
import {
  CAMERA_VIEWPORT_WIDTH,
  GRID_WIDTH,
} from "../../constants/worldConstants";
import { IConnectedPlayer } from "../../types/PlayerTypes";
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
    const playersNearby = this.getPlayersNearby(emitterId);

    if (playersNearby) {
      for (const player of playersNearby) {
        this.sendEventToUser(player.channelId, eventName, data);
      }
    }
  }

  public getPlayersNearby(emitterId: string): IConnectedPlayer[] {
    const players = GeckosServerHelper.connectedPlayers;

    const emitterPlayer = players.find((player) => player.id === emitterId);

    if (!emitterPlayer) {
      console.log("Error: emitter player not found to calculate distance");
      return [];
    }

    const playersUnderRange: IConnectedPlayer[] = [];

    for (const player of players) {
      if (player.id === emitterPlayer.id) {
        continue; // avoid sending to self
      }

      if (
        this.isUnderPlayerRange(
          emitterPlayer.x,
          emitterPlayer.y,
          player.x,
          player.y
        )
      ) {
        playersUnderRange.push(player);
      }
    }

    return playersUnderRange;
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

    const distanceThreshold = Math.floor(CAMERA_VIEWPORT_WIDTH / GRID_WIDTH);

    // calculate distance in tiles

    if (distance < distanceThreshold) {
      return true;
    }
    return false;
  }
}
