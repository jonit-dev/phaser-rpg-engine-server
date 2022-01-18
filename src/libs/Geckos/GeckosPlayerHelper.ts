//@ts-ignore
import { Data, ServerChannel } from "@geckos.io/server";
import { provide } from "inversify-binding-decorators";
import {
  PlayerCreationPayload,
  PlayerGeckosEvents,
  PlayerLogoutPayload,
} from "../../types/PlayerTypes";
import { GeckosServerHelper } from "../GeckosServerHelper";
import { GeckosMessagingHelper } from "./GeckosMessagingHelper";

@provide(GeckosPlayerHelper)
export class GeckosPlayerHelper {
  constructor(private geckosMessagingHelper: GeckosMessagingHelper) {}

  public bind(channel: ServerChannel) {
    this.onPlayerCreate(channel);
    this.onPlayerLogout(channel);
  }

  public onPlayerCreate(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.Create, (d: Data) => {
      const data = d as PlayerCreationPayload;

      console.log(`💡: Player ${data.name} has connected!`);
      GeckosServerHelper.connectedPlayers.push({
        id: data.id,
        name: data.name,
        x: data.x,
        y: data.y,
        channelId: data.channelId,
      });
      console.log(
        "- Total players connected:",
        GeckosServerHelper.connectedPlayers.length
      );

      const firstPlayer = GeckosServerHelper.connectedPlayers[0];

      this.geckosMessagingHelper.sendPrivateEvent(
        channel,
        firstPlayer.channelId,
        PlayerGeckosEvents.PrivateMessage,
        {
          message: `YOURE ARE THE FIRST PLAYER - ${firstPlayer.name}`,
        }
      );

      // broadcast to other players that a new player has joined
      // this.sendMessageToClosePlayers(
      //   channel,
      //   data.id,
      //   PlayerGeckosEvents.Create,
      //   data
      // );
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
}
