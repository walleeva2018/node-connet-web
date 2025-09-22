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

  // Publish message
  server.post("/publish", async (request, reply) => {
    const { subject, data } = request.body as { subject: string; data: any };

    if (!subject || !data) {
      reply.code(400);
      return { error: "subject and data are required" };
    }

    const success = await natsService.publish(subject, data);
    return success
      ? { success: true, message: `Published to ${subject}` }
      : { success: false, error: "NATS not connected" };
  });

  // Subscribe to ALL messages in real-time
  server.get("/subscribe", async (request, reply) => {
    reply.type("text/event-stream");
    reply.header("Cache-Control", "no-cache");
    reply.header("Connection", "keep-alive");
    reply.header("Access-Control-Allow-Origin", "*");

    // Send connection confirmation
    reply.raw.write(
      'data: {"type": "connected", "message": "Subscribed to all NATS messages"}\n\n'
    );

    // Subscribe to NATS and stream to client
    const subscription = natsService.subscribeToAll((subject, data) => {
      const event = {
        subject,
        data,
        timestamp: new Date().toISOString(),
      };
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    // Cleanup on disconnect
    request.socket.on("close", () => {
      console.log("📴 Client disconnected from stream");
      subscription?.unsubscribe();
    });
  });

  // Subscribe to specific subject
  server.get("/subscribe/:subject", async (request, reply) => {
    const { subject } = request.params as { subject: string };

    reply.type("text/event-stream");
    reply.header("Cache-Control", "no-cache");
    reply.header("Connection", "keep-alive");
    reply.header("Access-Control-Allow-Origin", "*");

    reply.raw.write(
      `data: {"type": "connected", "message": "Subscribed to ${subject}"}\n\n`
    );

    const subscription = natsService.subscribeToSubject(
      subject,
      (subject, data) => {
        const event = {
          subject,
          data,
          timestamp: new Date().toISOString(),
        };
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    );

    request.socket.on("close", () => {
      console.log(`📴 Client disconnected from ${subject}`);
      subscription?.unsubscribe();
    });
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
