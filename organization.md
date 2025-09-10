# Organization Service API Documentation

This document provides `curl` examples for interacting with the `OrganizationService` gRPC-Web endpoints.

---

## Base URL
```
http://localhost:8080/organization.v1.OrganizationService/
```

---

## 1. Create Organization

**Endpoint:**
`/CreateOrganization`

**Description:**
Creates a new organization.

**Request Body:**
```json
{
  "name": "string",
  "displayName": "string",
  "description": "string",
  "websiteUrl": "string"
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/organization.v1.OrganizationService/CreateOrganization \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Org",
    "displayName": "My New Organization",
    "description": "A new organization for testing",
    "websiteUrl": "https://myneworg.com"
  }'
```

---

## 2. Get Organization

**Endpoint:**
`/GetOrganization`

**Description:**
Fetches an organization by ID or UUID.

**Request Body:**
```json
{
  "id": "string|bigint"
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/organization.v1.OrganizationService/GetOrganization \
  -H "Content-Type: application/json" \
  -d '{
    "id": "org-uuid-1"
  }'
```

---

## 3. List Organizations

**Endpoint:**
`/ListOrganizations`

**Description:**
Lists organizations with optional filtering and pagination.

**Request Body:**
```json
{
  "pageSize": 10,
  "pageToken": "string",
  "status": 0,
  "role": 0,
  "isTrial": true,
  "isVerified": false
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/organization.v1.OrganizationService/ListOrganizations \
  -H "Content-Type: application/json" \
  -d '{
    "pageSize": 10,
    "pageToken": "",
    "status": 0,
    "role": 0,
    "isTrial": true,
    "isVerified": false
  }'
```

---

## 4. Update Organization

**Endpoint:**
`/UpdateOrganization`

**Description:**
Updates an existing organization.

**Request Body:**
```json
{
  "uuid": "string",
  "displayName": "string",
  "phoneNumber": "string",
  "company": "string",
  "newsletterSubscribed": true,
  "dropletLimit": 25,
  "tfaEnabled": true
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/organization.v1.OrganizationService/UpdateOrganization \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "org-uuid-1",
    "displayName": "Updated Org Name",
    "phoneNumber": "+1-555-333-4444",
    "company": "Updated Company Inc.",
    "newsletterSubscribed": true,
    "dropletLimit": 25,
    "tfaEnabled": true
  }'
```

---

## 5. Delete Organization

**Endpoint:**
`/DeleteOrganization`

**Description:**
Deletes an organization by UUID.

**Request Body:**
```json
{
  "uuid": "string"
}
```

**Example `curl`:**
```bash
curl -X POST http://localhost:8080/organization.v1.OrganizationService/DeleteOrganization \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "org-uuid-1"
  }'
```
