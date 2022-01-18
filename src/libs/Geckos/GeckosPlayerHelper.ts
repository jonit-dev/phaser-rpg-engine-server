//@ts-ignore
import { ServerChannel } from "@geckos.io/server";
import {
  PlayerCreationPayload,
  PlayerGeckosEvents,
  PlayerLogoutPayload,
} from "../../types/PlayerTypes";
import { GeckosServerHelper } from "../GeckosServerHelper";
import { Geckos } from "./Geckos";

export class GeckosPlayerHelper extends Geckos {
  public bind(channel: ServerChannel) {
    this.create(channel);
    this.logout(channel);
  }

  private create(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.Create, (d) => {
      const data = d as PlayerCreationPayload;

      console.log(`💡: Player ${data.id} has connected!`);
      GeckosServerHelper.connectedPlayers.push({
        id: data.id,
        x: data.x,
        y: data.y,
        roomId: data.id,
      });
      console.log(
        "- Total players connected:",
        GeckosServerHelper.connectedPlayers.length
      );

      this.sendPrivateEvent(
        channel,
        data.channelId,
        PlayerGeckosEvents.PrivateMessage,
        {
          message: "Hello World!",
        }
      );

      this.sendMessageToClosePlayers(
        channel,
        data.id,
        PlayerGeckosEvents.PrivateMessage,
        {
          message: "You're close, mate!",
        }
      );

      // broadcast to other players that a new player has joined
      channel.broadcast.emit(PlayerGeckosEvents.Create, data);
    });
  }

  private logout(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.Logout, (d) => {
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
