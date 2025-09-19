# Database Service API Documentation

This document provides `curl` examples for interacting with the `DatabaseService` gRPC-Web endpoints.

---

## Base URL
```
http://localhost:8080/database.v1.DatabaseService/
```

---

## 1. Get Create Options

**Endpoint:**
`/GetCreateOptions`

**Description:**
Gets available options for creating databases including supported types, regions, versions, and sizes.

**Request Body:**
```json
{
  "type": 0
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/database.v1.DatabaseService/GetCreateOptions \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1
  }'
```

**Response:**
```json
{
  "options": [
    {
      "type": "PG",
      "defaultVersion": "17",
      "regions": ["nyc1", "nyc3", "sfo2", "ams3"],
      "versions": ["14", "15", "16", "17"],
      "sizes": ["1-1-8-dd", "1-2-30-dd", "g-2-8-50-dd"]
    }
  ]
}
```

---

## 2. Get Regions

**Endpoint:**
`/GetRegions`

**Description:**
Gets available regions with VPC information for database deployment.

**Request Body:**
```json
{
  "type": 0
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/database.v1.DatabaseService/GetRegions \
  -H "Content-Type: application/json" \
  -d '{
    "type": 0
  }'
```

**Response:**
```json
{
  "regions": [
    {
      "region": "nyc3",
      "vpcs": [
        {
          "id": "95471191-dc84-11e8-80bc-3cfdfea9fba1",
          "name": "default-nyc3",
          "region": "nyc3",
          "ipRange": "10.132.0.0/16",
          "isDefault": true
        }
      ]
    }
  ]
}
```

---

## 3. Get Plans

**Endpoint:**
`/GetPlans`

**Description:**
Gets available pricing plans and configurations for database types.

**Request Body:**
```json
{
  "type": 1,
  "region": "string"
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/database.v1.DatabaseService/GetPlans \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1,
    "region": "nyc3"
  }'
```

**Response:**
```json
{
  "postgres": {
    "plans": [
      {
        "name": "1-1-8-dd",
        "monthlyPrice": 13.0,
        "vCpu": 1,
        "ramTotal": 1,
        "diskSize": 10,
        "sizeCategory": 1
      }
    ]
  },
  "mongodb": {
    "plans": []
  }
}
```

---

## 4. Create Database

**Endpoint:**
`/CreateDatabase`

**Description:**
Creates a new database cluster with specified configuration.

**Request Body:**
```json
{
  "name": "string",
  "region": "string",
  "size": "string",
  "storageSizeMib": "bigint",
  "type": 0,
  "version": "string",
  "layout": 0,
  "vpcUuid": "string",
  "projectUuid": "string",
  "tags": ["string"],
  "storageAutoscaleEnabled": true,
  "storageAutoscaleThreshold": 80,
  "storageAutoscaleIncrementMib": "bigint"
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/database.v1.DatabaseService/CreateDatabase \
  -H "Content-Type: application/json" \
  -d '{
    "name": "db-mongodb-nyc3-65128",
    "region": "nyc3",
    "size": "s-1-1-8-dd",
    "storageSizeMib": "15360",
    "type": 2,
    "version": "8.0",
    "layout": 1,
    "vpcUuid": "4084c4c1-582b-4b66-93ed-18c9a2dfe5de",
    "projectUuid": "b50b0eaf-4d8c-40fa-8d52-178a2acf341d",
    "tags": ["production", "mongodb"],
    "storageAutoscaleEnabled": false,
    "storageAutoscaleThreshold": 80,
    "storageAutoscaleIncrementMib": "51200"
  }'
```

**Response:**
```json
{
  "database": {
    "id": "db-1",
    "name": "db-mongodb-nyc3-65128",
    "region": "nyc3",
    "type": 2,
    "version": "8.0",
    "status": "creating",
    "endpoint": "db-mongodb-nyc3-65128.db.ondigitalocean.com",
    "port": 27017,
    "createdAt": "2025-09-16T10:30:00Z"
  }
}
```

---

## 5. List Databases

**Endpoint:**
`/ListDatabases`

**Description:**
Lists database clusters with optional filtering by region, type, project, and tags.

**Request Body:**
```json
{
  "region": "string",
  "type": 0,
  "tags": ["string"],
  "projectUuid": "string"
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/database.v1.DatabaseService/ListDatabases \
  -H "Content-Type: application/json" \
  -d '{
    "region": "nyc3",
    "type": 2,
    "tags": ["production"],
    "projectUuid": "b50b0eaf-4d8c-40fa-8d52-178a2acf341d"
    "userUuid": "user-uuid-1"
  }'
```

**Response:**
```json
{
  "databases": [
    {
      "id": "db-1",
      "name": "db-mongodb-nyc3-65128",
      "region": "nyc3",
      "type": 2,
      "version": "8.0",
      "status": "online",
      "endpoint": "db-mongodb-nyc3-65128.db.ondigitalocean.com",
      "port": 27017,
      "tags": ["production", "mongodb"]
    }
  ],
  "totalCount": 1
}
```

---

## 6. Update Database

**Endpoint:**
`/UpdateDatabase`

**Description:**
Updates an existing database cluster configuration.

**Request Body:**
```json
{
  "id": "string",
  "size": "string",
  "storageSizeMib": "bigint",
  "tags": ["string"],
  "storageAutoscale": {
    "enabled": true,
    "threshold": 80,
    "incrementMib": "bigint"
  }
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/database.v1.DatabaseService/UpdateDatabase \
  -H "Content-Type: application/json" \
  -d '{
    "id": "db-1",
    "size": "g-2-8-50-dd",
    "storageSizeMib": "30720",
    "tags": ["production", "mongodb", "updated"],
    "storageAutoscale": {
      "enabled": true,
      "threshold": 85,
      "incrementMib": "102400"
    }
  }'
```

**Response:**
```json
{
  "database": {
    "id": "db-1",
    "name": "db-mongodb-nyc3-65128",
    "size": "g-2-8-50-dd",
    "storageSizeMib": "30720",
    "tags": ["production", "mongodb", "updated"],
    "updatedAt": "2025-09-16T11:30:00Z"
  }
}
```

---

## 7. Delete Database

**Endpoint:**
`/DeleteDatabase`

**Description:**
Deletes a database cluster permanently.

**Request Body:**
```json
{
  "id": "string"
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/database.v1.DatabaseService/DeleteDatabase \
  -H "Content-Type: application/json" \
  -d '{
    "id": "db-1"
  }'
```

**Response:**
```json
{
  "message": "Database db-1 has been successfully deleted"
}
```

---

## Enum Values

### DatabaseType
- `0`: `DATABASE_TYPE_UNSPECIFIED`
- `1`: `DATABASE_TYPE_POSTGRES`
- `2`: `DATABASE_TYPE_MONGODB`

### DatabaseLayout
- `0`: `DATABASE_LAYOUT_UNSPECIFIED`
- `1`: `DATABASE_LAYOUT_SINGLE_NODE`
- `2`: `DATABASE_LAYOUT_MULTI_NODE_2`
- `3`: `DATABASE_LAYOUT_MULTI_NODE_6`
- `4`: `DATABASE_LAYOUT_MULTI_NODE_9`
- `5`: `DATABASE_LAYOUT_MULTI_NODE_15`

### SizeCategory
- `0`: `SIZE_CATEGORY_UNSPECIFIED`
- `1`: `SIZE_CATEGORY_STANDARD`
- `2`: `SIZE_CATEGORY_BASIC_PREMIUM_INTEL`
- `3`: `SIZE_CATEGORY_BASIC_PREMIUM_AMD`
- `4`: `SIZE_CATEGORY_GENERAL_PURPOSE`
- `5`: `SIZE_CATEGORY_STORAGE_OPTIMIZED`

---

## Common Size Options

### PostgreSQL Sizes
- `1-1-8-dd`: 1 vCPU, 1GB RAM, 10GB disk ($13/month)
- `1-2-30-dd`: 1 vCPU, 2GB RAM, 30GB disk ($24/month)
- `g-2-8-50-dd`: 2 vCPU, 8GB RAM, 30GB disk ($107/month)
- `g-4-16-100-dd`: 4 vCPU, 16GB RAM, 70GB disk ($212/month)

### MongoDB Sizes
- `s-1-1-8-dd`: 1 vCPU, 1GB RAM, 15GB disk ($12/month)
- `s-1-2-30-dd`: 1 vCPU, 2GB RAM, 34GB disk ($23.20/month)
- `g-2-8-50-dd`: 2 vCPU, 8GB RAM, 40GB disk ($107/month)
- `g-4-16-100-dd`: 4 vCPU, 16GB RAM, 90GB disk ($212/month)

---

## Available Regions
- `nyc1`, `nyc2`, `nyc3` - New York
- `sfo2`, `sfo3` - San Francisco
- `ams3` - Amsterdam
- `sgp1` - Singapore
- `lon1` - London
- `fra1` - Frankfurt
- `tor1` - Toronto
- `blr1` - Bangalore
- `syd1` - Sydney
- `atl1` - Atlanta