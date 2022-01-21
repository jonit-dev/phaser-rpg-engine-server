//@ts-ignore
import { Data, ServerChannel } from "@geckos.io/server";
import { provide } from "inversify-binding-decorators";
import { PlayerGeckosEvents, PlayerLogoutPayload } from "../../types/PlayerTypes";
import { GeckosMessagingHelper } from "../geckos/GeckosMessagingHelper";
import { GeckosServerHelper } from "../geckos/GeckosServerHelper";
import { GeckosPlayerPositionHelper } from "./GeckosPlayerPositionHelper";

@provide(GeckosPlayerHelper)
export class GeckosPlayerHelper {
  constructor(
    private geckosMessagingHelper: GeckosMessagingHelper,
    private geckosPlayerPositionHelper: GeckosPlayerPositionHelper
  ) {}

  public onAddEventListeners(channel: ServerChannel) {
    this.geckosPlayerPositionHelper.onAddEventListeners(channel);
    this.onPlayerLogout(channel);
  }

  public onPlayerLogout(channel: ServerChannel) {
    channel.on(PlayerGeckosEvents.PlayerLogout, (d: Data) => {
      const data = d as PlayerLogoutPayload;

      // warn nearby players that the emitter logged out

      const emitterPlayer = GeckosServerHelper.connectedPlayers.find((player) => player.id === data.id);

      if (!emitterPlayer) {
        console.log("Failed to emit logout message to nearby players. Emitter not found.");
        return;
      }

      const nearbyPlayers = this.geckosMessagingHelper.getPlayersOnCameraView(emitterPlayer.id);

      for (const player of nearbyPlayers) {
        this.geckosMessagingHelper.sendEventToUser<PlayerLogoutPayload>(
          player.channelId,
          PlayerGeckosEvents.PlayerLogout,
          data
        );
      }

      GeckosServerHelper.connectedPlayers = GeckosServerHelper.connectedPlayers.filter(
        (player) => player.id !== data.id
      );
      console.log(`🚪: Player id ${data.id} has disconnected`);
      console.log(`- Total players connected:`, GeckosServerHelper.connectedPlayers.length);
    });
  }
}
