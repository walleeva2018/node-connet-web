import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import cors from "@fastify/cors";
import vmService from "./connect.js";

async function main() {
  const server = fastify();

  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  await server.register(fastifyConnectPlugin, {
    routes: vmService,
  });

  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  const port = parseInt("8080");
  const host = "localhost";

  try {
    await server.listen({ port, host });
    console.log(`VM Service running on http://${host}:${port}`);
    console.log(`Health check: http://${host}:${port}/health`);
  } catch (err) {
    server.log.error(err);
  }
}

main().catch(console.error);
