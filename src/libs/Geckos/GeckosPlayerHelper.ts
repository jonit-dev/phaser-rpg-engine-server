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

  public bind(channel: ServerChannel) {
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

      this.geckosMessagingHelper.sendMessageToClosePlayers(
        data.id,
        PlayerGeckosEvents.Create,
        data
      );
    });
  }

  public onPlayerLogout(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.Logout, (d: Data) => {
      const data = d as PlayerLogoutPayload;

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
}
