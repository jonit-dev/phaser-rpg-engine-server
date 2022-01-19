//@ts-ignore
import { Data, ServerChannel } from "@geckos.io/server";
import { provide } from "inversify-binding-decorators";
import {
  PlayerCreationPayload,
  PlayerGeckosEvents,
  PlayerLogoutPayload,
  PlayerPositionPayload,
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
    channel.on(PlayerGeckosEvents.Create, (d: Data) => {
      const data = d as PlayerCreationPayload;

      console.log(`💡: Player ${data.name} has connected!`);
      console.log(data);
      GeckosServerHelper.connectedPlayers.push({
        id: data.id,
        name: data.name,
        x: data.x,
        y: data.y,
        channelId: data.channelId,
      });

      channel.join(data.channelId); // join channel specific to the user, to we can send direct messages later if we want.

      // channel.join(data.channelId);
      console.log(
        "- Total players connected:",
        GeckosServerHelper.connectedPlayers.length
      );

      this.sendCreationMessageToPlayers(data.channelId, data.id, data);
    });
  }

  public onPlayerLogout(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.Logout, (d: Data) => {
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

      const nearbyPlayers = this.geckosMessagingHelper.getPlayersNearby(
        emitterPlayer.id
      );

      for (const player of nearbyPlayers) {
        this.geckosMessagingHelper.sendEventToUser(
          player.channelId,
          PlayerGeckosEvents.Logout,
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
    channel.on(PlayerGeckosEvents.PositionUpdate, (d: Data) => {
      const data = d as PlayerPositionPayload;

      // update player position from connectedPlayers
      GeckosServerHelper.connectedPlayers.map((player) => {
        if (player.id === data.id) {
          player.x = data.x;
          player.y = data.y;
          player.direction = data.direction;

          this.geckosMessagingHelper.sendMessageToClosePlayers(
            data.id,
            PlayerGeckosEvents.PositionUpdate,
            data
          );
        }
        return player;
      });
    });
  }

  public sendCreationMessageToPlayers(
    emitterChannelId: string,
    emitterId: string,
    data: PlayerCreationPayload
  ) {
    const nearbyPlayers =
      this.geckosMessagingHelper.getPlayersNearby(emitterId);

    if (nearbyPlayers.length > 0) {
      for (const player of nearbyPlayers) {
        console.log(
          `Warning player **${player.name}** about **${data.name}** creation`
        );

        // tell other player that we exist, so it can create a new instance of us
        this.geckosMessagingHelper.sendEventToUser(
          player.channelId,
          PlayerGeckosEvents.Create,
          data
        );

        // tell the emitter player that this other player exist too :)

        this.geckosMessagingHelper.sendEventToUser(
          emitterChannelId,
          PlayerGeckosEvents.Create,
          {
            ...player,
          } as PlayerCreationPayload
        );

        console.log(
          `Warning player **${data.name}** about **${player.name}** creation`
        );
      }
    }
  }
}
