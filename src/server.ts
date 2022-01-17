import express from "express";
import { serverRouter } from "./resources/server/server.routes";

const app = express();

const port = process.env.PORT || 5000;

// Middlewares ========================================

app.use(serverRouter);

const server = app.listen(port, () => {
  console.log(`⚙️ Server running on port ${port}`);

  const geckos = async () => {
    // import geckos as ESM
    const { geckos } = await import("@geckos.io/server");
    const io = geckos();

    io.addServer(server);
    io.onConnection((channel) => {
      channel.on("chat message", (data) => {
        console.log(`got ${data} from "chat message"`);
        // emit the "chat message" data to all channels in the same room
        io.room(channel.roomId).emit("chat message", data);
      });
    });
  };

  geckos();
});
