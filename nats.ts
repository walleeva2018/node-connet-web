import { connect, JSONCodec } from "nats";
import type { NatsConnection } from "nats";

class NATSService {
  private connection: NatsConnection | null = null;
  private jc = JSONCodec();
  private demoInterval: ReturnType<typeof setInterval> | null = null;

  async connect(
    servers: string[] = ["nats://localhost:4222"]
  ): Promise<boolean> {
    try {
      this.connection = await connect({ servers });
      console.log(`✅ NATS connected to ${this.connection.getServer()}`);

      this.startDemoMessages();
      return true;
    } catch (err) {
      console.error("❌ Failed to connect to NATS:", err);
      return false;
    }
  }

  async publish(subject: string, data: any): Promise<boolean> {
    if (!this.connection) {
      console.warn("NATS not connected");
      return false;
    }

    try {
      const message = {
        ...data,
        timestamp: new Date().toISOString(),
        id: this.generateId(),
      };

      this.connection.publish(subject, this.jc.encode(message));
      console.log(`📤 Published to ${subject}:`, message);
      return true;
    } catch (err) {
      console.error("Error publishing message:", err);
      return false;
    }
  }

  // Real-time subscription for Server-Sent Events
  subscribeToAll(callback: (subject: string, data: any) => void) {
    if (!this.connection) return null;

    const sub = this.connection.subscribe(">");

    (async () => {
      for await (const msg of sub) {
        try {
          const data = this.jc.decode(msg.data);
          callback(msg.subject, data);
        } catch (err) {
          console.error("Error in subscription callback:", err);
        }
      }
    })();

    return sub;
  }

  subscribeToSubject(
    subject: string,
    callback: (subject: string, data: any) => void
  ) {
    if (!this.connection) return null;

    const sub = this.connection.subscribe(subject);

    (async () => {
      for await (const msg of sub) {
        try {
          const data = this.jc.decode(msg.data);
          callback(msg.subject, data);
        } catch (err) {
          console.error("Error in subject subscription:", err);
        }
      }
    })();

    return sub;
  }

  private startDemoMessages(): void {
    if (this.demoInterval) return;

    const demoMessages = [
      {
        subject: "alerts",
        data: { level: "critical", message: "Database connection lost" },
      },
      {
        subject: "alerts",
        data: { level: "warning", message: "High memory usage detected" },
      },
      { subject: "events", data: { event: "user_login", user: "john_doe" } },
      {
        subject: "events",
        data: { event: "file_uploaded", filename: "document.pdf" },
      },
      {
        subject: "notifications",
        data: { type: "info", message: "System backup completed" },
      },
      {
        subject: "notifications",
        data: { type: "success", message: "Deployment successful" },
      },
      { subject: "status", data: { service: "web-server", status: "healthy" } },
      { subject: "status", data: { service: "database", status: "degraded" } },
    ];

    this.demoInterval = setInterval(() => {
      const randomMessage =
        demoMessages[Math.floor(Math.random() * demoMessages.length)]!;
      this.publish(randomMessage.subject, randomMessage.data);
    }, 4000); // Every 4 seconds

    console.log("🚀 Demo messages started (every 4 seconds)");
  }

  stopDemoMessages(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
      console.log("⏹️ Demo messages stopped");
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  isConnected(): boolean {
    return !!this.connection;
  }

  getInfo() {
    return {
      connected: this.isConnected(),
      server: this.connection?.getServer() || null,
    };
  }

  async close(): Promise<void> {
    this.stopDemoMessages();
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      console.log("✅ NATS service closed");
    }
  }
}

export const natsService = new NATSService();
export default natsService;
