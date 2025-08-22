import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import cors from "@fastify/cors";
import vmService from "./connect.js";

async function main() {
  const server = fastify();

  // Add CORS support for web clients
  await server.register(cors, {
    origin: true, // Allow all origins in development
    credentials: true,
  });

  // Register Connect plugin
  await server.register(fastifyConnectPlugin, {
    routes: vmService,
  });

  // Health check endpoint
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Start the server
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
