import "dotenv/config";
import { Server } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";
import { DatabaseExtension } from "./extensions/database.js";
import { AuthExtension } from "./extensions/auth.js";

const port = parseInt(process.env.COLLAB_PORT ?? "1234", 10);
const host = process.env.COLLAB_HOST ?? "0.0.0.0";

const server = Server.configure({
  port,
  extensions: [
    new Logger(),
    new AuthExtension(),
    new DatabaseExtension(),
  ],
});

server.listen(port, host, () => {
  console.log(`[collab] Hocuspocus server running on ${host}:${port}`);
});
