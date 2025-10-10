import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import cors from "@fastify/cors";
import vmService from "./connect.js";
import k8s from "./k8s.js";
import user from "./user.js";
import organization from "./organization.js";
import project from "./project.js";
import team from "./team.js";
import database from "./database.js";
import natsService from "./nats.js";
import websocket from "@fastify/websocket";
async function main() {
  const server = fastify();

  // Initialize NATS
  await natsService.connect();

  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  await server.register(fastifyConnectPlugin, {
    routes: vmService,
  });

  await server.register(fastifyConnectPlugin, {
    routes: k8s,
  });

  await server.register(fastifyConnectPlugin, {
    routes: user,
  });

  await server.register(fastifyConnectPlugin, {
    routes: organization,
  });

  await server.register(fastifyConnectPlugin, {
    routes: project,
  });
  await server.register(fastifyConnectPlugin, {
    routes: team,
  });

  await server.register(fastifyConnectPlugin, {
    routes: database,
  });

  // Health check
  server.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      nats: natsService.getInfo(),
    };
  });
  const port = 8080;
  const host = "localhost";

  try {
    await server.listen({ port, host });
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📡 Subscribe: curl -N http://${host}:${port}/subscribe`);
    console.log(
      `📤 Publish: curl -X POST http://${host}:${port}/publish -H "Content-Type: application/json" -d '{"subject":"test","data":{"message":"hello"}}'`
    );
  } catch (err) {
    server.log.error(err);
  }
}

main().catch(console.error);
