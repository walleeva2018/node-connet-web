import type { ConnectRouter } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { ConnectError, Code } from "@connectrpc/connect";

import {
  BillingService,
  GetBillingRequestSchema,
  GetBillingResponseSchema,
  GetBillingUsageRequestSchema,
  GetBillingUsageResponseSchema,
  CreateBudgetAlertRequestSchema,
  CreateBudgetAlertResponseSchema,
  GetBudgetAlertsRequestSchema,
  GetBudgetAlertsResponseSchema,
  BillingInfoSchema,
  CardInfoSchema,
  ResourceBillingInfoSchema,
  ResourceUsageSchema,
  UsageDataPointSchema,
  UsageLineItemSchema,
  BudgetAlertSchema,
  BudgetType,
  ResourceType,
  type GetBillingRequest,
  type GetBillingUsageRequest,
  type CreateBudgetAlertRequest,
  type GetBudgetAlertsRequest,
  type BudgetAlert,
} from "./gen/billing/v1/billing_pb.js";

// In-memory storage for demo purposes
export const budgetAlerts: Array<{
  id: string;
  userId: string;
  budgetName: string;
  budgetType: BudgetType;
  budgetLimit: number;
  budgetEmail: string;
  usage: number;
  createdAt: string;
  resourceType: ResourceType;
}> = [
  {
    id: "budget-1",
    userId: "user-uuid-1",
    budgetName: "Monthly Infrastructure Budget",
    budgetType: BudgetType.MONTHLY,
    budgetLimit: 500,
    budgetEmail: "alerts@example.com",
    usage: 234.56,
    createdAt: "2025-01-01T00:00:00Z",
    resourceType: ResourceType.ALL,
  },
  {
    id: "budget-2",
    userId: "user-uuid-1",
    budgetName: "Yearly Cloud Budget",
    budgetType: BudgetType.YEARLY,
    budgetLimit: 5000,
    budgetEmail: "finance@example.com",
    usage: 1842.33,
    createdAt: "2025-01-01T00:00:00Z",
    resourceType: ResourceType.ALL,
  },
  {
    id: "budget-3",
    userId: "org-uuid-2",
    budgetName: "Development Environment Budget",
    budgetType: BudgetType.MONTHLY,
    budgetLimit: 300,
    budgetEmail: "dev-team@example.com",
    usage: 178.90,
    createdAt: "2025-01-15T00:00:00Z",
    resourceType: ResourceType.KUBERNETES,
  },
];

// Mock billing data by user
export const billingData: Record<
  string,
  {
    kubernetes: { instance: number; price: number };
    vm: { instance: number; price: number };
    database: { instance: number; price: number };
  }
> = {
  "user-uuid-1": {
    kubernetes: { instance: 3, price: 45.0 },
    vm: { instance: 1, price: 24.0 },
    database: { instance: 2, price: 30.0 },
  },
  "org-uuid-2": {
    kubernetes: { instance: 5, price: 75.0 },
    vm: { instance: 3, price: 72.0 },
    database: { instance: 1, price: 15.0 },
  },
  "org-uuid-1": {
    kubernetes: { instance: 2, price: 30.0 },
    vm: { instance: 0, price: 0 },
    database: { instance: 1, price: 15.0 },
  },
};

// Mock card data by user
export const cardData: Record<string, { card4digit: string }> = {
  "user-uuid-1": {
    card4digit: "1293",
  },
  "org-uuid-2": {
    card4digit: "4567",
  },
  "org-uuid-1": {
    card4digit: "8901",
  },
};

// Mock usage line items data
const kubernetesLineItems = [
  { sku: "Kubernetes Cluster - Standard", units: 720, pricePerUnit: 0.10, grossAmount: 72.00, billedAmount: 72.00 },
  { sku: "Kubernetes Node - Premium", units: 2160, pricePerUnit: 0.05, grossAmount: 108.00, billedAmount: 108.00 },
  { sku: "Load Balancer", units: 1, pricePerUnit: 15.00, grossAmount: 15.00, billedAmount: 15.00 },
  { sku: "Persistent Storage (GB)", units: 500, pricePerUnit: 0.10, grossAmount: 50.00, billedAmount: 50.00 },
];

const vmLineItems = [
  { sku: "VM Premium Instance", units: 133, pricePerUnit: 0.0500, grossAmount: 6.65, billedAmount: 0.00 },
  { sku: "VM Standard Instance", units: 720, pricePerUnit: 0.025, grossAmount: 18.00, billedAmount: 18.00 },
  { sku: "VM CPU Hours", units: 2880, pricePerUnit: 0.01, grossAmount: 28.80, billedAmount: 28.80 },
  { sku: "VM Memory (GB-hours)", units: 5760, pricePerUnit: 0.005, grossAmount: 28.80, billedAmount: 28.80 },
  { sku: "VM Storage (GB)", units: 250, pricePerUnit: 0.08, grossAmount: 20.00, billedAmount: 20.00 },
];

const databaseLineItems = [
  { sku: "Database Instance - Standard", units: 720, pricePerUnit: 0.075, grossAmount: 54.00, billedAmount: 54.00 },
  { sku: "Database Storage (GB)", units: 100, pricePerUnit: 0.15, grossAmount: 15.00, billedAmount: 15.00 },
  { sku: "Database Backup Storage (GB)", units: 50, pricePerUnit: 0.05, grossAmount: 2.50, billedAmount: 2.50 },
  { sku: "Database I/O Operations (1M)", units: 10, pricePerUnit: 0.20, grossAmount: 2.00, billedAmount: 2.00 },
];

// Helper function to generate usage data based on timeframe
function generateUsageData(timeframe: string): number[][] {
  const now = Date.now();
  let dataPoints: number[][] = [];

  // Parse timeframe (e.g., "7d", "30d", "90d")
  const days = parseInt(timeframe.replace("d", "")) || 30;
  const intervalMs = (days * 24 * 60 * 60 * 1000) / 10; // 10 data points

  for (let i = 0; i < 10; i++) {
    const timestamp = now - (9 - i) * intervalMs;
    const cost = Math.random() * 50 + 10; // Random cost between 10-60
    dataPoints.push([timestamp, cost]);
  }

  return dataPoints;
}

export default function (router: ConnectRouter) {
  router.service(BillingService, {
    // Get billing information
    getBilling: async (request: GetBillingRequest, context) => {
      const checker = context.requestHeader.get("X-CSRF-Token");

      if (!checker) {
        throw new ConnectError("Authentication required", Code.Unauthenticated);
      }

      const userId = request.userId || "user-uuid-1";
      const userBillingData = billingData[userId] || {
        kubernetes: { instance: 0, price: 0 },
        vm: { instance: 0, price: 0 },
        database: { instance: 0, price: 0 },
      };

      const userCardData = cardData[userId] || {
        card4digit: "****",
      };

      return create(GetBillingResponseSchema, {
        billingInfo: create(BillingInfoSchema, {
          kubernetes: create(ResourceBillingInfoSchema, userBillingData.kubernetes),
          vm: create(ResourceBillingInfoSchema, userBillingData.vm),
          database: create(ResourceBillingInfoSchema, userBillingData.database),
        }),
        cardInfo: create(CardInfoSchema, userCardData),
      });
    },

    // Get billing usage
    getBillingUsage: async (request: GetBillingUsageRequest, context) => {
      const checker = context.requestHeader.get("X-CSRF-Token");

      if (!checker) {
        throw new ConnectError("Authentication required", Code.Unauthenticated);
      }

      const timeframe = request.timeframe || "30d";

      // Generate mock usage data for each resource type
      const kubernetesData = generateUsageData(timeframe);
      const vmData = generateUsageData(timeframe);
      const databaseData = generateUsageData(timeframe);

      return create(GetBillingUsageResponseSchema, {
        kubernetes: create(ResourceUsageSchema, {
          dataPoints: kubernetesData.map(([timestamp, cost]) =>
            create(UsageDataPointSchema, { timestamp: BigInt(timestamp), cost })
          ),
          lineItems: kubernetesLineItems.map((item) =>
            create(UsageLineItemSchema, item)
          ),
        }),
        vm: create(ResourceUsageSchema, {
          dataPoints: vmData.map(([timestamp, cost]) =>
            create(UsageDataPointSchema, { timestamp: BigInt(timestamp), cost })
          ),
          lineItems: vmLineItems.map((item) =>
            create(UsageLineItemSchema, item)
          ),
        }),
        database: create(ResourceUsageSchema, {
          dataPoints: databaseData.map(([timestamp, cost]) =>
            create(UsageDataPointSchema, { timestamp: BigInt(timestamp), cost })
          ),
          lineItems: databaseLineItems.map((item) =>
            create(UsageLineItemSchema, item)
          ),
        }),
      });
    },

    // Create budget alert
    createBudgetAlert: async (request: CreateBudgetAlertRequest, context) => {
      const checker = context.requestHeader.get("X-CSRF-Token");

      if (!checker) {
        throw new ConnectError("Authentication required", Code.Unauthenticated);
      }

      const newAlert: BudgetAlert = {
        $typeName: "billing.v1.BudgetAlert",
        id: `budget-${Date.now()}`,
        userId: request.userId,
        budgetName: request.budgetName,
        budgetType: request.budgetType,
        budgetLimit: request.budgetLimit,
        budgetEmail: request.budgetEmail,
        usage: 0, // Initial usage is 0
        createdAt: new Date().toISOString(),
        resourceType: request.resourceType,
      };

      budgetAlerts.push(newAlert as any);

      return create(CreateBudgetAlertResponseSchema, {
        budgetAlert: create(BudgetAlertSchema, newAlert),
        message: "Budget alert created successfully",
      });
    },

    // Get budget alerts
    getBudgetAlerts: async (request: GetBudgetAlertsRequest, context) => {
      const checker = context.requestHeader.get("X-CSRF-Token");

      if (!checker) {
        throw new ConnectError("Authentication required", Code.Unauthenticated);
      }

      // Filter alerts by user ID
      const userAlerts = budgetAlerts.filter(
        (alert) => alert.userId === request.userId
      );

      // If no alerts exist, create some mock data
      if (userAlerts.length === 0 && request.userId === "user-uuid-1") {
        const mockAlert: BudgetAlert = {
          $typeName: "billing.v1.BudgetAlert",
          id: "budget-1",
          userId: request.userId,
          budgetName: "Monthly Infrastructure Budget",
          budgetType: BudgetType.MONTHLY,
          budgetLimit: 500,
          budgetEmail: "alerts@example.com",
          usage: 234.56,
          createdAt: new Date().toISOString(),
          resourceType: ResourceType.ALL,
        };

        budgetAlerts.push(mockAlert as any);

        return create(GetBudgetAlertsResponseSchema, {
          budgetAlerts: [create(BudgetAlertSchema, mockAlert)],
        });
      }

      return create(GetBudgetAlertsResponseSchema, {
        budgetAlerts: userAlerts.map((alert) =>
          create(BudgetAlertSchema, alert)
        ),
      });
    },
  });
}
