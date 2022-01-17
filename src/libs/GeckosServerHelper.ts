import { Server } from "http";
import {
  PlayerCreationPayload,
  PlayerGeckosEvents,
  PlayerLogoutPayload,
} from "../types/PlayerTypes";

export class GeckosServerHelper {
  public connectedPlayerIds: string[] = [];

  public async init(httpServer: Server) {
    // import geckos as ESM
    const { geckos } = await import("@geckos.io/server");
    const io = geckos();
    io.listen(3000);

    io.addServer(httpServer);

    io.onConnection((channel) => {
      // channel.on("chat message", (data) => {
      //   console.log("new incoming message!");
      //   console.log(data);
      //   // emit the "chat message" data to all channels in the same room
      //   io.room(channel.roomId).emit("chat message", data);
      // });
      channel.on(PlayerGeckosEvents.Create, (d) => {
        const data = d as PlayerCreationPayload;

        console.log(PlayerGeckosEvents.Create);
        console.log(`💡: Player ${data.id} has connected!`);
        this.connectedPlayerIds.push(data.id);
        console.log(
          "- Total players connected:",
          this.connectedPlayerIds.length
        );

        // broadcast to other players that a new player has joined
        channel.broadcast.emit(PlayerGeckosEvents.Create, data);
      });

      channel.on(PlayerGeckosEvents.Logout, (d) => {
        const data = d as PlayerLogoutPayload;

        this.connectedPlayerIds = this.connectedPlayerIds.filter(
          (id) => id !== data.id
        );

        console.log(`🚪: Player id ${data.id} has disconnected`);
        console.log(
          `- Total players connected:`,
          this.connectedPlayerIds.length
        );
      });
    });
  }
}
