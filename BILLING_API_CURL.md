# Billing API - cURL Commands

## 1. GetBilling
Get current billing information with resource counts and costs.

```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBilling \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1"
  }'
```

**Response:**
```json
{
  "billingInfo": {
    "kubernetes": {"instance": 3, "price": 45.0},
    "vm": {"instance": 1, "price": 24.0},
    "database": {"instance": 2, "price": 30.0}
  },
  "cardInfo": {"card4digit": "1293"}
}
```

---

## 2. GetBillingUsage
Get historical usage data for a timeframe (7d, 30d, 90d).

```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBillingUsage \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "timeframe": "30d"
  }'
```

**Response:**
```json
{
  "kubernetes": {
    "dataPoints": [
      {"timestamp": 1735689600000, "cost": 35.42},
      {"timestamp": 1736294400000, "cost": 38.15}
    ]
  },
  "vm": {
    "dataPoints": [
      {"timestamp": 1735689600000, "cost": 20.15},
      {"timestamp": 1736294400000, "cost": 22.89}
    ]
  },
  "database": {
    "dataPoints": [
      {"timestamp": 1735689600000, "cost": 28.90},
      {"timestamp": 1736294400000, "cost": 29.45}
    ]
  }
}
```

---

## 3. CreateBudgetAlert

### Create Alert for ALL Resources
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "Total Monthly Budget",
    "budgetType": 1,
    "budgetLimit": 1000.0,
    "budgetEmail": "alerts@example.com",
    "resourceType": 1
  }'
```

### Create Alert for KUBERNETES Only
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "Kubernetes Monthly Budget",
    "budgetType": 1,
    "budgetLimit": 400.0,
    "budgetEmail": "k8s-alerts@example.com",
    "resourceType": 3
  }'
```

### Create Alert for VM Only
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "VM Budget",
    "budgetType": 1,
    "budgetLimit": 300.0,
    "budgetEmail": "vm-alerts@example.com",
    "resourceType": 2
  }'
```

### Create Alert for DATABASE Only
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "Database Budget",
    "budgetType": 1,
    "budgetLimit": 200.0,
    "budgetEmail": "db-alerts@example.com",
    "resourceType": 4
  }'
```

### Create Yearly Budget Alert
```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1",
    "budgetName": "Annual Infrastructure Budget",
    "budgetType": 2,
    "budgetLimit": 12000.0,
    "budgetEmail": "finance@example.com",
    "resourceType": 1
  }'
```

**Response:**
```json
{
  "budgetAlert": {
    "id": "budget-1735689600000",
    "userId": "user-uuid-1",
    "budgetName": "Total Monthly Budget",
    "budgetType": 1,
    "budgetLimit": 1000.0,
    "budgetEmail": "alerts@example.com",
    "usage": 0.0,
    "createdAt": "2025-01-01T00:00:00Z",
    "resourceType": 1
  },
  "message": "Budget alert created successfully"
}
```

---

## 4. GetBudgetAlerts
Get all budget alerts for a user.

```bash
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBudgetAlerts \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{
    "userId": "user-uuid-1"
  }'
```

**Response:**
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
      "budgetName": "Kubernetes Budget",
      "budgetType": 1,
      "budgetLimit": 200.0,
      "budgetEmail": "k8s@example.com",
      "usage": 145.20,
      "createdAt": "2025-01-15T00:00:00Z",
      "resourceType": 3
    }
  ]
}
```

---

## Enum Reference

### BudgetType
- `0` - UNSPECIFIED
- `1` - MONTHLY
- `2` - YEARLY
- `3` - CUSTOM

### ResourceType
- `0` - UNSPECIFIED
- `1` - ALL (all resources combined)
- `2` - VM (virtual machines only)
- `3` - KUBERNETES (kubernetes clusters only)
- `4` - DATABASE (databases only)

---

## Testing Commands

### Test All Endpoints
```bash
# 1. Get billing info
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBilling \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: test-token" \
  -d '{"userId": "user-uuid-1"}'

# 2. Get usage data
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBillingUsage \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: test-token" \
  -d '{"userId": "user-uuid-1", "timeframe": "30d"}'

# 3. Create budget alert
curl -X POST http://localhost:8080/billing.v1.BillingService/CreateBudgetAlert \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: test-token" \
  -d '{"userId": "user-uuid-1", "budgetName": "Test Budget", "budgetType": 1, "budgetLimit": 500, "budgetEmail": "test@test.com", "resourceType": 1}'

# 4. Get all alerts
curl -X POST http://localhost:8080/billing.v1.BillingService/GetBudgetAlerts \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: test-token" \
  -d '{"userId": "user-uuid-1"}'
```
