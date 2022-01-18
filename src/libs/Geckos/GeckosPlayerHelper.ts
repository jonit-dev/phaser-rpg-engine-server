//@ts-ignore
import { Data, ServerChannel } from "@geckos.io/server";
import {
  PlayerCreationPayload,
  PlayerGeckosEvents,
  PlayerLogoutPayload,
} from "../../types/PlayerTypes";
import { GeckosServerHelper } from "../GeckosServerHelper";

export class GeckosPlayerHelper {
  public bind(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.Create, this.onPlayerCreate);
    channel.on(PlayerGeckosEvents.Logout, this.onPlayerLogout);
  }

  public onPlayerCreate(d: Data) {
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

    // this.sendPrivateEvent(
    //   channel,
    //   firstPlayer.channelId,
    //   PlayerGeckosEvents.PrivateMessage,
    //   {
    //     message: `YOURE ARE THE FIRST PLAYER - ${firstPlayer.name}`,
    //   }
    // );

    // broadcast to other players that a new player has joined
    // this.sendMessageToClosePlayers(
    //   channel,
    //   data.id,
    //   PlayerGeckosEvents.Create,
    //   data
    // );
  }

  public onPlayerLogout(d: Data) {
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
  }
}
