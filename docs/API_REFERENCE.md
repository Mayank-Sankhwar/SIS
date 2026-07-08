# API Reference

Base URL: `/api/v1`

JSON success responses use:

```json
{
  "success": true,
  "message": "Operation message",
  "data": {}
}
```

Errors are returned by the global error middleware. Common statuses are `400`, `401`, `403`, `404`, `409`, `422`, and `500`.

## Authentication

### POST `/auth/login`

Description: Authenticate a user and return a bearer token.

Authentication: None.

Allowed roles: Public.

Request body:

```json
{
  "email": "super.admin@sis.gov.in",
  "password": "Password@123"
}
```

Validation rules: `email` must be a valid email. `password` must be at least 8 characters.

Example response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "user": {
      "id": "<uuid>",
      "name": "Super Admin",
      "email": "super.admin@sis.gov.in",
      "role": "ADMIN"
    }
  }
}
```

Business rules: inactive or deleted users cannot log in. Invalid credentials return `401`.

Status codes: `200`, `401`, `403`, `422`, `500`.

### GET `/auth/profile`

Description: Return authenticated user profile, reporting parent, and assigned areas.

Authentication: Bearer token.

Allowed roles: any authenticated active user.

Request body: none.

Query parameters: none.

Path parameters: none.

Example response:

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "<uuid>",
    "name": "Super Admin",
    "email": "super.admin@sis.gov.in",
    "role": "ADMIN",
    "reportingParent": null,
    "assignedAreas": []
  }
}
```

Status codes: `200`, `401`, `403`, `500`.

## User Management

### POST `/users`

Description: Create a child user and area mappings.

Authentication: Bearer token.

Allowed roles: `ADMIN`, `EE`, `AE`.

Request body:

```json
{
  "name": "Executive Engineer 1",
  "email": "ee.1@sis.gov.in",
  "role": "EE",
  "employeeId": "EMP-001",
  "designation": "Executive Engineer",
  "areaMappings": [
    {
      "areaType": "ZONE",
      "zoneId": "<uuid>",
      "isPrimary": true
    }
  ]
}
```

Validation rules: `name` 2-150 chars, `email` valid and max 255, `role` one of `EE`, `AE`, `JE`, optional `employeeId` 2-100 chars, optional `designation` 2-150 chars, at least one `areaMappings` entry. Each mapping must contain exactly one matching area id for its `areaType`.

Business rules: `ADMIN` can create `EE`; `EE` can create `AE`; `AE` can create `JE`. Exactly one primary mapping is required. Creator can only assign areas within their own active assignments. Duplicate email, employee ID, or area mapping is rejected.

Example response:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {},
    "temporaryPassword": "<generated-password>",
    "areaMappings": []
  }
}
```

Status codes: `201`, `401`, `403`, `409`, `422`, `500`.

### PATCH `/users/me/profile`

Description: Complete or update the current user's profile fields.

Authentication: Bearer token.

Allowed roles: any authenticated active user.

Request body:

```json
{
  "mobileNumber": "9000000001",
  "employeeId": "EMP-001",
  "designation": "Executive Engineer",
  "profileData": {}
}
```

Validation rules: `mobileNumber` 8-20 chars, `employeeId` 2-100 chars, `designation` 2-150 chars, `profileData` object defaults to `{}`.

Business rules: duplicate mobile number and employee ID are rejected.

Status codes: `200`, `401`, `409`, `422`, `500`.

## CRUD Endpoint Summary

The following modules use the same JSON response envelope. Create returns `201`; read, update, and delete return `200`. Delete operations are soft deletes. All routes require bearer authentication unless stated otherwise.

| Module | Create | List | Get | Update | Delete | Roles |
|---|---|---|---|---|---|---|
| Discom | `POST /discoms` | `GET /discoms` | `GET /discoms/:id` | `PATCH /discoms/:id` | `DELETE /discoms/:id` | ADMIN |
| Zone | `POST /zones` | `GET /zones` | `GET /zones/:id` | `PATCH /zones/:id` | `DELETE /zones/:id` | ADMIN |
| Vertical | `POST /verticals` | `GET /verticals` | `GET /verticals/:id` | `PATCH /verticals/:id` | `DELETE /verticals/:id` | ADMIN |
| SubVertical | `POST /sub-verticals` | `GET /sub-verticals` | `GET /sub-verticals/:id` | `PATCH /sub-verticals/:id` | `DELETE /sub-verticals/:id` | ADMIN |
| Substation | `POST /substations` | `GET /substations` | `GET /substations/:id` | `PATCH /substations/:id` | `DELETE /substations/:id` | C/U ADMIN,EE,AE; R ADMIN,EE,AE,JE; D ADMIN |
| Incoming Source | `POST /incoming-sources` | `GET /incoming-sources` | `GET /incoming-sources/:id` | `PATCH /incoming-sources/:id` | `DELETE /incoming-sources/:id` | C/U/D ADMIN,EE,AE; R ADMIN,EE,AE,JE |
| Outgoing Feeder | `POST /outgoing-feeders` | `GET /outgoing-feeders` | `GET /outgoing-feeders/:id` | `PATCH /outgoing-feeders/:id` | `DELETE /outgoing-feeders/:id` | C/U/D ADMIN,EE,AE; R ADMIN,EE,AE,JE |
| Transformer | `POST /transformers` | `GET /transformers` | `GET /transformers/:id` | `PATCH /transformers/:id` | `DELETE /transformers/:id` | C/U/D ADMIN,EE,AE; R ADMIN,EE,AE,JE |
| Lightning Arrester | `POST /lightning-arresters` | `GET /lightning-arresters` | `GET /lightning-arresters/:id` | `PATCH /lightning-arresters/:id` | `DELETE /lightning-arresters/:id` | C/U/D ADMIN,EE,AE; R ADMIN,EE,AE,JE |
| Battery Bank | `POST /battery-banks` | `GET /battery-banks` | `GET /battery-banks/:id` | `PATCH /battery-banks/:id` | `DELETE /battery-banks/:id` | C/U/D ADMIN,EE,AE; R ADMIN,EE,AE,JE |
| Capacitor Bank | `POST /capacitor-banks` | `GET /capacitor-banks` | `GET /capacitor-banks/:id` | `PATCH /capacitor-banks/:id` | `DELETE /capacitor-banks/:id` | C/U/D ADMIN,EE,AE; R ADMIN,EE,AE,JE |

Path parameters: all `:id` parameters must be UUIDs.

Common list query parameters: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `includeDeleted` where supported, hierarchy filters where supported, and module-specific numeric/status filters.

Common business rules: parent hierarchy must exist, be active, and not deleted. Non-admin users are constrained by assigned area mappings. Duplicate unique keys return `409`. Deleted records cannot be updated.

## Master Data Request Bodies

### Discom

Create:

```json
{
  "name": "Northern Power Distribution Company",
  "code": "NDISCOM"
}
```

Update: partial `name` and/or `code`; at least one field required.

Validation: `name` max 150, `code` max 50.

### Zone

Create:

```json
{
  "discomId": "<uuid>",
  "name": "North Zone",
  "code": "NZONE"
}
```

Update: partial `discomId`, `name`, `code`; at least one field required.

Validation: UUID parent, `name` max 150, `code` max 50.

### Vertical

Create:

```json
{
  "zoneId": "<uuid>",
  "name": "Distribution Vertical",
  "code": "DIST-VERT"
}
```

Update: partial `zoneId`, `name`, `code`; at least one field required.

### SubVertical

Create:

```json
{
  "verticalId": "<uuid>",
  "name": "Operations SubVertical",
  "code": "OPS-SV"
}
```

Update: partial `verticalId`, `name`, `code`; at least one field required.

### Substation

Create:

```json
{
  "subVerticalId": "<uuid>",
  "name": "Central 33/11 KV Substation",
  "code": "SS-CENTRAL-01",
  "voltageLevelKv": 33,
  "address": "Feeder Road",
  "latitude": 28.61,
  "longitude": 77.2,
  "commissioningDate": "2020-01-15",
  "isActive": true
}
```

Update: partial `name`, `code`, `voltageLevelKv`, `address`, `latitude`, `longitude`, `commissioningDate`, `isActive`; at least one field required.

Validation: strict body, positive voltage, latitude `-90..90`, longitude `-180..180`, commissioning date cannot be future.

## Equipment Request Bodies

### Incoming Source

```json
{
  "substationId": "<uuid>",
  "sourceName": "132 KV Bhopal Grid",
  "sourceType": "GRID",
  "voltageLevelKv": 132,
  "feederName": "BPL-GRID-1",
  "meterNumber": "MTR-BPL-1001",
  "isActive": true
}
```

Required on create: `substationId`, `sourceName`, `voltageLevelKv`.

Update fields: `sourceName`, `sourceType`, `voltageLevelKv`, `feederName`, `meterNumber`, `isActive`.

### Outgoing Feeder

```json
{
  "substationId": "<uuid>",
  "feederName": "Govindpura Industrial Feeder",
  "feederCode": "FD-GOV-IND-01",
  "voltageLevelKv": 11,
  "feederType": "INDUSTRIAL",
  "connectedLoadMw": 18.5,
  "isActive": true
}
```

Required on create: `substationId`, `feederName`, `voltageLevelKv`. `connectedLoadMw` cannot be negative.

### Transformer

```json
{
  "substationId": "<uuid>",
  "transformerCode": "PTR-GOV-01",
  "capacityMva": 10,
  "primaryVoltageKv": 33,
  "secondaryVoltageKv": 11,
  "make": "BHEL",
  "serialNumber": "TR-BPL-2018-001",
  "commissioningDate": "2018-04-01",
  "isActive": true
}
```

Required on create: `substationId`, `transformerCode`, `capacityMva`, `primaryVoltageKv`, `secondaryVoltageKv`. Numeric values must be positive. Commissioning date cannot be future.

### Lightning Arrester

```json
{
  "substationId": "<uuid>",
  "arresterCode": "LA-GOV-01",
  "locationDescription": "33 KV incoming bay",
  "voltageRatingKv": 33,
  "make": "Siemens",
  "serialNumber": "LA-BPL-001",
  "installationDate": "2019-06-01",
  "isActive": true
}
```

Required on create: `substationId`, `arresterCode`, `voltageRatingKv`. Installation date cannot be future.

### Battery Bank

```json
{
  "substationId": "<uuid>",
  "batteryBankCode": "BB-GOV-01",
  "batteryType": "VRLA",
  "voltageV": 220,
  "capacityAh": 300,
  "cellCount": 110,
  "make": "Exide",
  "installationDate": "2020-01-15",
  "isActive": true
}
```

Required on create: `substationId`, `batteryBankCode`, `voltageV`, `capacityAh`. `cellCount` cannot be negative.

### Capacitor Bank

```json
{
  "substationId": "<uuid>",
  "capacitorBankCode": "CB-GOV-01",
  "capacityMvar": 2.5,
  "voltageLevelKv": 11,
  "stepsCount": 5,
  "make": "L&T",
  "installationDate": "2020-03-20",
  "isActive": true
}
```

Required on create: `substationId`, `capacitorBankCode`, `capacityMvar`, `voltageLevelKv`. `stepsCount` cannot be negative.

## List Query Parameters

Hierarchy list modules:

- `page`: positive integer, default `1`.
- `limit`: positive integer, max `100`, default `10` for Discom-Zone-Vertical-SubVertical and `20` for Substation/equipment.
- `search`: optional trimmed string.
- `sortOrder`: `asc` or `desc`, default `desc`.
- `isActive`: `true` or `false` where supported.
- `includeDeleted`: `true` or `false`, default `false` for Substation and equipment.

Allowed `sortBy` values:

- Discom/Zone/Vertical/SubVertical: `name`, `code`, `createdAt`, `updatedAt`, `isActive`.
- Substation: `name`, `code`, `createdAt`, `updatedAt`, `commissioningDate`, `voltageLevelKv`.
- Incoming Source: `sourceName`, `sourceType`, `voltageLevelKv`, `feederName`, `meterNumber`, `isActive`, `createdAt`, `updatedAt`.
- Outgoing Feeder: `feederName`, `feederCode`, `voltageLevelKv`, `feederType`, `connectedLoadMw`, `isActive`, `createdAt`, `updatedAt`.
- Transformer: `transformerCode`, `capacityMva`, `primaryVoltageKv`, `secondaryVoltageKv`, `make`, `serialNumber`, `commissioningDate`, `isActive`, `createdAt`, `updatedAt`.
- Lightning Arrester: `arresterCode`, `locationDescription`, `voltageRatingKv`, `make`, `serialNumber`, `installationDate`, `isActive`, `createdAt`, `updatedAt`.
- Battery Bank: `batteryBankCode`, `batteryType`, `voltageV`, `capacityAh`, `cellCount`, `make`, `installationDate`, `isActive`, `createdAt`, `updatedAt`.
- Capacitor Bank: `capacitorBankCode`, `capacityMvar`, `voltageLevelKv`, `stepsCount`, `make`, `installationDate`, `isActive`, `createdAt`, `updatedAt`.

## Imports

### POST `/imports/validate`

Description: Validate a SIS `.xlsx` workbook without inserting master data.

Authentication: Bearer token.

Allowed roles: `ADMIN`, `EE`, `AE`.

Request body: `multipart/form-data` with `file`.

Validation rules: file is required, extension must be `.xlsx`, maximum size is 10 MB, workbook cannot be empty.

Example response:

```json
{
  "success": true,
  "message": "Workbook validation completed",
  "data": {
    "isValid": true,
    "workbookSummary": {
      "sheetCount": 11,
      "requiredSheetCount": 11,
      "totalRows": 0
    },
    "sheetNames": [],
    "sheets": [],
    "validationErrors": [],
    "validationWarnings": [],
    "uploadedFile": {
      "id": "<uuid>",
      "originalFileName": "substation_master.xlsx",
      "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "fileSizeBytes": 12345,
      "checksum": "<sha256>"
    },
    "importJob": {
      "id": "<uuid>",
      "status": "COMPLETED",
      "totalRows": 0,
      "failedRows": 0
    }
  }
}
```

Status codes: `200`, `400`, `401`, `403`, `422`, `500`.

### POST `/imports`

Description: Validate and import a SIS `.xlsx` workbook.

Authentication: Bearer token.

Allowed roles: `ADMIN`, `EE`, `AE`.

Request body: `multipart/form-data` with `file` and optional `mode`.

`mode`: `UPSERT` default, or `INSERT_ONLY`.

Business rules: invalid workbook returns success envelope with validation result and failed import job. `UPSERT` updates existing records by natural keys; `INSERT_ONLY` skips existing records and creates missing ones.

Status codes: `200`, `400`, `401`, `403`, `422`, `500`.

## Dashboard

All dashboard endpoints require bearer authentication and allow `ADMIN`, `EE`, `AE`, and `JE`.

| Method | URL | Description | Query parameters | Response message |
|---|---|---|---|---|
| GET | `/dashboard/summary` | Counts hierarchy and equipment totals | none | Dashboard summary fetched successfully |
| GET | `/dashboard/equipment-summary` | Aggregated equipment analytics | none | Dashboard equipment summary fetched successfully |
| GET | `/dashboard/hierarchy-summary` | Discom hierarchy aggregates | none | Dashboard hierarchy summary fetched successfully |
| GET | `/dashboard/equipment-distribution` | Equipment counts grouped by hierarchy | `discomId`, `zoneId`, `verticalId`, `subVerticalId`, `substationId`, `dateFrom`, `dateTo` | Dashboard equipment distribution fetched successfully |
| GET | `/dashboard/substation-status` | Active/inactive substations by hierarchy | same filters | Dashboard substation status fetched successfully |
| GET | `/dashboard/transformer-capacity` | Transformer capacity rollups | same filters | Dashboard transformer capacity fetched successfully |
| GET | `/dashboard/feeder-load` | Outgoing feeder load rollups | same filters | Dashboard feeder load fetched successfully |
| GET | `/dashboard/import-history` | Recent import jobs, max 20 | `dateFrom`, `dateTo` | Dashboard import history fetched successfully |
| GET | `/dashboard/recent-import-errors` | Recent import errors, max 100 | `dateFrom`, `dateTo` | Dashboard recent import errors fetched successfully |
| GET | `/dashboard/map` | Active substations with coordinates and equipment counts | hierarchy/date filters | Dashboard map data fetched successfully |

Validation rules: date filters must parse as valid dates. Hierarchy filters are accepted as non-empty strings by the dashboard controller.

Status codes: `200`, `401`, `403`, `422`, `500`.

## Reports

All report endpoints require bearer authentication and allow `ADMIN`, `EE`, `AE`, and `JE`.

| Method | URL | Description | Format |
|---|---|---|---|
| GET | `/reports/substations` | Substation report | `format=json|xlsx|pdf`, default `json` |
| GET | `/reports/transformers` | Transformer report | `format=json|xlsx|pdf`, default `json` |
| GET | `/reports/feeders` | Outgoing feeder report | `format=json|xlsx|pdf`, default `json` |
| GET | `/reports/equipment-summary` | Equipment summary report | `format=json|xlsx|pdf`, default `json` |
| GET | `/reports/substations/pdf` | Printable substation PDF | forced PDF |
| GET | `/reports/transformers/pdf` | Printable transformer PDF | forced PDF |
| GET | `/reports/feeders/pdf` | Printable feeder PDF | forced PDF |
| GET | `/reports/equipment-summary/pdf` | Printable equipment summary PDF | forced PDF |
| GET | `/reports/import-history` | Import history report | `format=json|xlsx|pdf`, default `json` |
| GET | `/reports/import-errors` | Import error report | `format=json|xlsx|pdf`, default `json` |
| GET | `/reports/audit-log` | Audit-style report from created/updated/deleted metadata | `format=json|xlsx|pdf`, default `json` |

Query parameters: `format`, `dateFrom`, `dateTo`, `discomId`, `zoneId`, `verticalId`, `subVerticalId`, `substationId`, `voltageLevelKv`, `isActive`.

Validation rules: `format` must be `json`, `xlsx`, or `pdf`; numeric filters must be valid numbers; `isActive` must be `true` or `false`; dates must be valid.

Response rules: JSON uses the standard response envelope. XLSX returns content type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. PDF returns `application/pdf`.

Status codes: `200`, `401`, `403`, `422`, `500`.

## Health

### GET `/health`

Description: Health check.

Authentication: none.

Allowed roles: public.

Query parameters: `verbose` optional boolean.

Status codes: `200`, `422`, `500`.
