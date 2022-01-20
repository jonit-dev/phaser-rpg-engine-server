//@ts-ignore
import { Data, ServerChannel } from "@geckos.io/server";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { GRID_HEIGHT, GRID_WIDTH } from "../../constants/worldConstants";
import {
  IConnectedPlayer,
  PlayerGeckosEvents,
  PlayerLogoutPayload,
} from "../../types/PlayerTypes";
import { GeckosServerHelper } from "../GeckosServerHelper";
import { GeckosMessagingHelper } from "./GeckosMessagingHelper";

@provide(GeckosPlayerHelper)
export class GeckosPlayerHelper {
  constructor(private geckosMessagingHelper: GeckosMessagingHelper) {}

  public onAddEventListeners(channel: ServerChannel) {
    this.onPlayerCreate(channel);
    this.onPlayerLogout(channel);
    this.onPlayerUpdatePosition(channel);
  }

  public onPlayerCreate(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.PlayerCreate, (d: Data) => {
      const data = d as IConnectedPlayer;

      console.log(`💡: Player ${data.name} has connected!`);
      console.log(data);
      GeckosServerHelper.connectedPlayers.push(data);

      channel.join(data.channelId); // join channel specific to the user, to we can send direct  later if we want.

      console.log(
        "- Total players connected:",
        GeckosServerHelper.connectedPlayers.length
      );

      this.sendCreationMessageToPlayers(data.channelId, data.id, data);
    });
  }

  public onPlayerLogout(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.PlayerLogout, (d: Data) => {
      const data = d as PlayerLogoutPayload;

      // warn nearby players that the emitter logged out

      const emitterPlayer = GeckosServerHelper.connectedPlayers.find(
        (player) => player.id === data.id
      );

      if (!emitterPlayer) {
        console.log(
          "Failed to emit logout message to nearby players. Emitter not found."
        );
        return;
      }

      const nearbyPlayers = this.geckosMessagingHelper.getPlayersOnCameraView(
        emitterPlayer.id
      );

      for (const player of nearbyPlayers) {
        this.geckosMessagingHelper.sendEventToUser<PlayerLogoutPayload>(
          player.channelId,
          PlayerGeckosEvents.PlayerLogout,
          data
        );
      }

      GeckosServerHelper.connectedPlayers =
        GeckosServerHelper.connectedPlayers.filter(
          (player) => player.id !== data.id
        );
      console.log(`🚪: Player id ${data.id} has disconnected`);
      console.log(
        `- Total players connected:`,
        GeckosServerHelper.connectedPlayers.length
      );
    });
  }

  public onPlayerUpdatePosition(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.PlayerPositionUpdate, (d: Data) => {
      const data = d as IConnectedPlayer;

      // update emitter position from connectedPlayers
      GeckosServerHelper.connectedPlayers =
        GeckosServerHelper.connectedPlayers.map((player) => {
          if (player.id === data.id) {
            // we have this adjustments because the client sends the initial x, y, not the actual final x, y after the player stops on the grid
            if (player.id === data.id) {
              if (data.direction === "up") {
                player.y = data.y - GRID_HEIGHT;
              }
              if (data.direction === "down") {
                player.y = data.y + GRID_HEIGHT;
              }
              if (data.direction === "left") {
                player.x = data.x - GRID_WIDTH;
              }
              if (data.direction === "right") {
                player.x = data.x + GRID_WIDTH;
              }
            }

            // here we're removing x and y because we already updated it above with new values and we don't want to overwrite them!

            const updateData = _.omit(data, ["x", "y"]);

            player = {
              ...player,
              ...updateData,
            };

            console.log(
              `📨 Received ${PlayerGeckosEvents.PlayerPositionUpdate}(${
                player.name
              }): ${JSON.stringify(player)}`
            );
          }
          return player;
        });

      // warn nearby players that the emitter moved
      console.log("warning nearby players about emitter position update");
      this.geckosMessagingHelper.sendMessageToClosePlayers<IConnectedPlayer>(
        data.id,
        PlayerGeckosEvents.PlayerPositionUpdate,
        data
      );

      // update the emitter nearby players positions
      const nearbyPlayers = this.geckosMessagingHelper.getPlayersOnCameraView(
        data.id
      );
      console.log("warning emitter about nearby players positions");

      if (nearbyPlayers) {
        for (const player of nearbyPlayers) {
          if (player.id !== data.id) {
            this.geckosMessagingHelper.sendEventToUser<IConnectedPlayer>(
              data.channelId,
              PlayerGeckosEvents.PlayerPositionUpdate,
              {
                ...player,
                isMoving: false,
              }
            );
          }
        }
      }
    });
  }

  public sendCreationMessageToPlayers(
    emitterChannelId: string,
    emitterId: string,
    data: IConnectedPlayer
  ) {
    const nearbyPlayers =
      this.geckosMessagingHelper.getPlayersOnCameraView(emitterId);

    console.log("warning nearby players...");
    console.log(nearbyPlayers);

    if (nearbyPlayers.length > 0) {
      for (const player of nearbyPlayers) {
        // tell other player that we exist, so it can create a new instance of us
        this.geckosMessagingHelper.sendEventToUser<IConnectedPlayer>(
          player.channelId,
          PlayerGeckosEvents.PlayerCreate,
          data
        );

        // tell the emitter about these other players too

        this.geckosMessagingHelper.sendEventToUser<IConnectedPlayer>(
          emitterChannelId,
          PlayerGeckosEvents.PlayerCreate,
          player
        );
      }
    }
  }
}
