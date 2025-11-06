# Billing API Documentation

## Overview
The Billing Service provides APIs for managing billing information, usage tracking, and budget alerts with support for different resource types (Kubernetes, VM, Database).

## Base Information
- **Package**: `billing.v1`
- **Protocol**: gRPC/Connect
- **Authentication**: Required via `X-CSRF-Token` header

---

## Enums

### BudgetType
Defines the type of budget period:
- `BUDGET_TYPE_UNSPECIFIED` (0) - Default/unspecified
- `BUDGET_TYPE_MONTHLY` (1) - Monthly budget cycle
- `BUDGET_TYPE_YEARLY` (2) - Yearly budget cycle
- `BUDGET_TYPE_CUSTOM` (3) - Custom budget period

### ResourceType
Defines the resource type for budget tracking:
- `RESOURCE_TYPE_UNSPECIFIED` (0) - Default/unspecified
- `RESOURCE_TYPE_ALL` (1) - All resources combined
- `RESOURCE_TYPE_VM` (2) - Virtual machines only
- `RESOURCE_TYPE_KUBERNETES` (3) - Kubernetes clusters only
- `RESOURCE_TYPE_DATABASE` (4) - Databases only

---

## API Endpoints

### 1. GetBilling
Retrieves current billing information including resource usage and payment method.

**Request**
```json
{
  "userId": "string"
}
```

**Response**
```json
{
  "billingInfo": {
    "kubernetes": {
      "instance": 0,
      "price": 0.0
    },
    "vm": {
      "instance": 0,
      "price": 0.0
    },
    "database": {
      "instance": 0,
      "price": 0.0
    }
  },
  "cardInfo": {
    "card4digit": "string"
  }
}
```

**Example**
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBilling \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1"
  }'
```

**Response Example**
```json
{
  "billingInfo": {
    "kubernetes": {
      "instance": 3,
      "price": 45.0
    },
    "vm": {
      "instance": 1,
      "price": 24.0
    },
    "database": {
      "instance": 2,
      "price": 30.0
    }
  },
  "cardInfo": {
    "card4digit": "1293"
  }
}
```

---

### 2. GetBillingUsage
Retrieves historical billing usage data over a specified timeframe.

**Request**
```json
{
  "userId": "string",
  "timeframe": "string"  // e.g., "7d", "30d", "90d"
}
```

**Response**
```json
{
  "kubernetes": {
    "dataPoints": [
      {
        "timestamp": "number",  // Unix timestamp in milliseconds
        "cost": 0.0
      }
    ]
  },
  "vm": {
    "dataPoints": [
      {
        "timestamp": "number",
        "cost": 0.0
      }
    ]
  },
  "database": {
    "dataPoints": [
      {
        "timestamp": "number",
        "cost": 0.0
      }
    ]
  }
}
```

**Example**
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBillingUsage \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "timeframe": "30d"
  }'
```

**Response Example**
```json
{
  "kubernetes": {
    "dataPoints": [
      {"timestamp": 1735689600000, "cost": 35.42},
      {"timestamp": 1736294400000, "cost": 38.15},
      {"timestamp": 1736899200000, "cost": 42.78}
    ]
  },
  "vm": {
    "dataPoints": [
      {"timestamp": 1735689600000, "cost": 20.15},
      {"timestamp": 1736294400000, "cost": 22.89},
      {"timestamp": 1736899200000, "cost": 24.50}
    ]
  },
  "database": {
    "dataPoints": [
      {"timestamp": 1735689600000, "cost": 28.90},
      {"timestamp": 1736294400000, "cost": 29.45},
      {"timestamp": 1736899200000, "cost": 31.20}
    ]
  }
}
```

---

### 3. CreateBudgetAlert
Creates a new budget alert with specified limits and resource type.

**Request**
```json
{
  "userId": "string",
  "budgetName": "string",
  "budgetType": 0,  // BudgetType enum value
  "budgetLimit": 0.0,
  "budgetEmail": "string",
  "resourceType": 0  // ResourceType enum value
}
```

**Response**
```json
{
  "budgetAlert": {
    "id": "string",
    "userId": "string",
    "budgetName": "string",
    "budgetType": 0,
    "budgetLimit": 0.0,
    "budgetEmail": "string",
    "usage": 0.0,
    "createdAt": "string",
    "resourceType": 0
  },
  "message": "string"
}
```

**Example - All Resources**
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "Monthly Infrastructure Budget",
    "budgetType": 1,
    "budgetLimit": 500.0,
    "budgetEmail": "alerts@example.com",
    "resourceType": 1
  }'
```

**Example - Kubernetes Only**
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "Kubernetes Monthly Budget",
    "budgetType": 1,
    "budgetLimit": 200.0,
    "budgetEmail": "k8s-alerts@example.com",
    "resourceType": 3
  }'
```

**Example - VM Only**
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "VM Yearly Budget",
    "budgetType": 2,
    "budgetLimit": 3000.0,
    "budgetEmail": "vm-alerts@example.com",
    "resourceType": 2
  }'
```

**Example - Database Only**
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "Database Budget",
    "budgetType": 1,
    "budgetLimit": 150.0,
    "budgetEmail": "db-alerts@example.com",
    "resourceType": 4
  }'
```

**Response Example**
```json
{
  "budgetAlert": {
    "id": "budget-1735689600000",
    "userId": "user-uuid-1",
    "budgetName": "Monthly Infrastructure Budget",
    "budgetType": 1,
    "budgetLimit": 500.0,
    "budgetEmail": "alerts@example.com",
    "usage": 0.0,
    "createdAt": "2025-01-01T00:00:00Z",
    "resourceType": 1
  },
  "message": "Budget alert created successfully"
}
```

---

### 4. GetBudgetAlerts
Retrieves all budget alerts for a specific user.

**Request**
```json
{
  "userId": "string"
}
```

**Response**
```json
{
  "budgetAlerts": [
    {
      "id": "string",
      "userId": "string",
      "budgetName": "string",
      "budgetType": 0,
      "budgetLimit": 0.0,
      "budgetEmail": "string",
      "usage": 0.0,
      "createdAt": "string",
      "resourceType": 0
    }
  ]
}
```

**Example**
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBudgetAlerts \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1"
  }'
```

**Response Example**
```json
{
  "budgetAlerts": [
    {
      "id": "budget-1",
      "userId": "user-uuid-1",
      "budgetName": "Monthly Infrastructure Budget",
      "budgetType": 1,
      "budgetLimit": 500.0,
      "budgetEmail": "alerts@example.com",
      "usage": 234.56,
      "createdAt": "2025-01-01T00:00:00Z",
      "resourceType": 1
    },
    {
      "id": "budget-2",
      "userId": "user-uuid-1",
      "budgetName": "Kubernetes Monthly Budget",
      "budgetType": 1,
      "budgetLimit": 200.0,
      "budgetEmail": "k8s-alerts@example.com",
      "usage": 145.20,
      "createdAt": "2025-01-15T00:00:00Z",
      "resourceType": 3
    }
  ]
}
```

---

## Resource Type Usage

### Budget Alert Scenarios

1. **Monitor All Resources**
   - Use `resourceType: RESOURCE_TYPE_ALL (1)`
   - Tracks combined spending across Kubernetes, VM, and Database

2. **Monitor Kubernetes Only**
   - Use `resourceType: RESOURCE_TYPE_KUBERNETES (3)`
   - Tracks only Kubernetes cluster costs

3. **Monitor VMs Only**
   - Use `resourceType: RESOURCE_TYPE_VM (2)`
   - Tracks only virtual machine costs

4. **Monitor Databases Only**
   - Use `resourceType: RESOURCE_TYPE_DATABASE (4)`
   - Tracks only database costs

---

## Error Handling

All endpoints return standard Connect/gRPC errors:

**401 Unauthenticated**
```json
{
  "code": "unauthenticated",
  "message": "Authentication required"
}
```

**Example Error Response**
```bash
# Missing X-CSRF-Token header
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBilling \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid-1"}'

# Response:
{
  "code": "unauthenticated",
  "message": "Authentication required"
}
```

---

## Complete Usage Example (JavaScript/TypeScript)

```typescript
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { BillingService } from "./gen/billing/v1/billing_pb";

// Create transport
const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
  defaultHeaders: {
    "X-CSRF-Token": "your-token-here"
  }
});

// Create client
const client = createClient(BillingService, transport);

// Get billing info
const billing = await client.getBilling({ userId: "user-uuid-1" });
console.log("Kubernetes instances:", billing.billingInfo.kubernetes.instance);
console.log("Kubernetes cost:", billing.billingInfo.kubernetes.price);

// Get usage data
const usage = await client.getBillingUsage({
  userId: "user-uuid-1",
  timeframe: "30d"
});
console.log("Kubernetes usage data:", usage.kubernetes.dataPoints);

// Create budget alert for all resources
const allResourcesAlert = await client.createBudgetAlert({
  userId: "user-uuid-1",
  budgetName: "Total Monthly Budget",
  budgetType: BudgetType.MONTHLY,
  budgetLimit: 1000,
  budgetEmail: "finance@company.com",
  resourceType: ResourceType.ALL
});

// Create budget alert for Kubernetes only
const k8sAlert = await client.createBudgetAlert({
  userId: "user-uuid-1",
  budgetName: "K8s Cluster Budget",
  budgetType: BudgetType.MONTHLY,
  budgetLimit: 400,
  budgetEmail: "devops@company.com",
  resourceType: ResourceType.KUBERNETES
});

// Get all budget alerts
const alerts = await client.getBudgetAlerts({ userId: "user-uuid-1" });
alerts.budgetAlerts.forEach(alert => {
  console.log(`${alert.budgetName}: $${alert.usage}/$${alert.budgetLimit}`);
  console.log(`Resource Type: ${ResourceType[alert.resourceType]}`);
});
```

---

## Notes

1. **Resource Types**: All budget alerts now support resource type filtering, allowing you to track spending per resource category
2. **Naming Change**: All references to "droplets" have been replaced with "kubernetes"
3. **Authentication**: All endpoints require the `X-CSRF-Token` header
4. **Timestamps**: Usage data timestamps are Unix timestamps in milliseconds (BigInt/number)
5. **Default Values**: If no data exists for a user, default values (0 instances, $0 cost) are returned
