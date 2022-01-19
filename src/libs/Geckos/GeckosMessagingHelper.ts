//@ts-ignore
import { provide } from "inversify-binding-decorators";
import {
  CAMERA_VIEWPORT_WIDTH, GRID_WIDTH
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
    const playersNearby = this.getPlayersOnCameraView(emitterId);

    if (playersNearby) {
      for (const player of playersNearby) {
        this.sendEventToUser(player.channelId, eventName, data);
      }
    }
  }

  public getPlayersOnCameraView(emitterId: string): IConnectedPlayer[] {
    const otherPlayers = GeckosServerHelper.connectedPlayers;

    const emitterPlayer = otherPlayers.find(
      (player) => player.id === emitterId
    );

    if (!emitterPlayer) {
      console.log("Error: emitter player not found to calculate distance");
      return [];
    }

    const playersUnderRange: IConnectedPlayer[] = [];

    for (const player of otherPlayers) {
      if (player.id === emitterPlayer.id) {
        continue; // avoid sending to self
      }

      if (
        this.isUnderPlayerCamera(
          player.x * 32, // we have to multiply because emitter x,y is on grid format
          player.y * 32,
          emitterPlayer.cameraCoordinates
        ) ||
        this.isUnderPlayerCamera(
          emitterPlayer.x * 32,
          emitterPlayer.y * 32,
          player.cameraCoordinates
        )
      ) {
        playersUnderRange.push(player);
      }
    }

    //! Debug code
    // if (playersUnderRange.length > 0) {
    //   console.log(
    //     `Players under range of ${emitterPlayer.name}: ${playersUnderRange.map(
    //       (player) =>
    //         `${player.name} | X: ${player.x * GRID_WIDTH} | Y: ${
    //           player.y * GRID_HEIGHT
    //         }`
    //     )}`
    //   );
    }

    return playersUnderRange;
  }

  private isUnderPlayerCamera(
    x: number,
    y: number,
    camera: ICameraCoordinates
  ): boolean {
    return this.mathHelper.isXYInsideRectangle(
      { x: x, y: y },
      {
        top: camera.y,
        left: camera.x,
        bottom: camera.height,
        right: camera.width,
      }
    );
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
