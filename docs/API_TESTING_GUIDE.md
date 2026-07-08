# API Testing Guide

Base URL: `http://localhost:3000/api/v1`

Use the seed admin account after running `npm run prisma:seed`:

```json
{
  "email": "super.admin@sis.gov.in",
  "password": "Password@123"
}
```

Use `Authorization: Bearer {{token}}` for protected endpoints.

## Expected Response Patterns

Success:

```json
{
  "success": true,
  "message": "Operation message",
  "data": {}
}
```

Expected common failures:

- `401`: missing, invalid, or expired token.
- `403`: role denied, inactive user, or area denied.
- `404`: record or requested area not found.
- `409`: duplicate unique key, deleted record, or delete blocked by children.
- `422`: validation error.

## Testing Order

### 1 Login

Request:

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "super.admin@sis.gov.in",
  "password": "Password@123"
}
```

Expected success: `200`, `accessToken`, `tokenType: Bearer`, and user details.

Expected failure: invalid email/password returns `401`; short password returns validation error.

Role testing: not role-restricted.

Validation testing: invalid email, missing password, password shorter than 8 chars.

### 2 Users

Create EE:

```http
POST /api/v1/users
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "name": "Executive Engineer Test",
  "email": "ee.test@sis.gov.in",
  "role": "EE",
  "employeeId": "EMP-EE-TEST",
  "designation": "Executive Engineer",
  "areaMappings": [
    {
      "areaType": "ZONE",
      "zoneId": "{{zoneId}}",
      "isPrimary": true
    }
  ]
}
```

Expected success: `201`, created user, generated `temporaryPassword`, and area mappings.

Expected failure: duplicate email `409`, invalid role hierarchy `403`, no primary mapping `422`, mapping outside creator scope `403`.

Role testing: ADMIN creates EE; EE creates AE; AE creates JE; JE cannot create users.

Complete profile:

```http
PATCH /api/v1/users/me/profile
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "mobileNumber": "9000000099",
  "employeeId": "EMP-099",
  "designation": "Engineer",
  "profileData": {}
}
```

Expected success: `200`. Expected failure: duplicate mobile or employee ID `409`.

### 3 Discom

Endpoints: `POST /discoms`, `GET /discoms`, `GET /discoms/:id`, `PATCH /discoms/:id`, `DELETE /discoms/:id`.

Sample create:

```json
{
  "name": "Northern Power Distribution Company",
  "code": "NDISCOM"
}
```

Expected success: create `201`, list/get/update/delete `200`.

Expected failure: non-admin `403`, duplicate name or code `409`, invalid UUID `422`.

Role testing: only ADMIN succeeds.

Validation testing: empty `name`, empty `code`, invalid `sortBy`, `limit > 100`.

### 4 Zone

Endpoints: `POST /zones`, `GET /zones`, `GET /zones/:id`, `PATCH /zones/:id`, `DELETE /zones/:id`.

Sample create:

```json
{
  "discomId": "{{discomId}}",
  "name": "North Zone",
  "code": "NZONE"
}
```

Expected failure: missing/inactive/deleted Discom `422`, duplicate within Discom `409`, delete with child Verticals `409`.

### 5 Vertical

Endpoints: `POST /verticals`, `GET /verticals`, `GET /verticals/:id`, `PATCH /verticals/:id`, `DELETE /verticals/:id`.

Sample create:

```json
{
  "zoneId": "{{zoneId}}",
  "name": "Distribution Vertical",
  "code": "DIST-VERT"
}
```

Expected failure: missing/inactive/deleted Zone hierarchy `422`, duplicate within Zone `409`, delete with child SubVerticals `409`.

### 6 SubVertical

Endpoints: `POST /sub-verticals`, `GET /sub-verticals`, `GET /sub-verticals/:id`, `PATCH /sub-verticals/:id`, `DELETE /sub-verticals/:id`.

Sample create:

```json
{
  "verticalId": "{{verticalId}}",
  "name": "Operations SubVertical",
  "code": "OPS-SV"
}
```

Expected failure: missing/inactive/deleted parent hierarchy `422`, duplicate within Vertical `409`, delete with child Substations `409`.

### 7 Substation

Endpoints: `POST /substations`, `GET /substations`, `GET /substations/:id`, `PATCH /substations/:id`, `DELETE /substations/:id`.

Sample create:

```json
{
  "subVerticalId": "{{subVerticalId}}",
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

Expected success: ADMIN/EE/AE create/update; ADMIN/EE/AE/JE read; ADMIN delete.

Expected failure: JE create `403`, non-admin delete `403`, invalid coordinates `422`, future commissioning date `422`, duplicate name/code within SubVertical `409`, delete with equipment `409`.

### 8 Incoming Sources

Endpoints: `POST /incoming-sources`, `GET /incoming-sources`, `GET /incoming-sources/:id`, `PATCH /incoming-sources/:id`, `DELETE /incoming-sources/:id`.

Sample create:

```json
{
  "substationId": "{{substationId}}",
  "sourceName": "132 KV Bhopal Grid",
  "sourceType": "GRID",
  "voltageLevelKv": 132,
  "feederName": "BPL-GRID-1",
  "meterNumber": "MTR-BPL-1001",
  "isActive": true
}
```

Expected failure: duplicate source name in Substation `409`, invalid voltage `422`, outside area `403`.

### 9 Outgoing Feeders

Endpoints: `POST /outgoing-feeders`, `GET /outgoing-feeders`, `GET /outgoing-feeders/:id`, `PATCH /outgoing-feeders/:id`, `DELETE /outgoing-feeders/:id`.

Sample create:

```json
{
  "substationId": "{{substationId}}",
  "feederName": "Govindpura Industrial Feeder",
  "feederCode": "FD-GOV-IND-01",
  "voltageLevelKv": 11,
  "feederType": "INDUSTRIAL",
  "connectedLoadMw": 18.5,
  "isActive": true
}
```

Validation testing: negative `connectedLoadMw`, empty `feederType`, invalid UUID, duplicate feeder name/code.

### 10 Transformers

Endpoints: `POST /transformers`, `GET /transformers`, `GET /transformers/:id`, `PATCH /transformers/:id`, `DELETE /transformers/:id`.

Sample create:

```json
{
  "substationId": "{{substationId}}",
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

Validation testing: non-positive capacity/voltage, future commissioning date, duplicate transformer code or serial number.

### 11 Lightning Arresters

Endpoints: `POST /lightning-arresters`, `GET /lightning-arresters`, `GET /lightning-arresters/:id`, `PATCH /lightning-arresters/:id`, `DELETE /lightning-arresters/:id`.

Sample create:

```json
{
  "substationId": "{{substationId}}",
  "arresterCode": "LA-GOV-01",
  "locationDescription": "33 KV incoming bay",
  "voltageRatingKv": 33,
  "make": "Siemens",
  "serialNumber": "LA-BPL-001",
  "installationDate": "2019-06-01",
  "isActive": true
}
```

Validation testing: non-positive voltage rating, future installation date, duplicate arrester code or serial number.

### 12 Battery Banks

Endpoints: `POST /battery-banks`, `GET /battery-banks`, `GET /battery-banks/:id`, `PATCH /battery-banks/:id`, `DELETE /battery-banks/:id`.

Sample create:

```json
{
  "substationId": "{{substationId}}",
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

Validation testing: non-positive voltage/capacity, negative `cellCount`, future installation date.

### 13 Capacitor Banks

Endpoints: `POST /capacitor-banks`, `GET /capacitor-banks`, `GET /capacitor-banks/:id`, `PATCH /capacitor-banks/:id`, `DELETE /capacitor-banks/:id`.

Sample create:

```json
{
  "substationId": "{{substationId}}",
  "capacitorBankCode": "CB-GOV-01",
  "capacityMvar": 2.5,
  "voltageLevelKv": 11,
  "stepsCount": 5,
  "make": "L&T",
  "installationDate": "2020-03-20",
  "isActive": true
}
```

Validation testing: non-positive capacity/voltage, negative `stepsCount`, future installation date.

### 14 Excel Validation

Request:

```http
POST /api/v1/imports/validate
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

Body: `file=@official_sis_import_template.xlsx`.

Expected success: `200`, workbook summary, sheet summaries, validation errors/warnings, uploaded file metadata, import job metadata.

Expected failure: missing file `400`, non-`.xlsx` `400`, oversized file `400`, invalid role `403`.

Role testing: ADMIN/EE/AE allowed; JE denied.

Validation testing: missing required sheet, missing columns, wrong header order, empty file.

### 15 Excel Import

Request:

```http
POST /api/v1/imports
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

Body: `file=@sis_successful_import_sample.xlsx`, `mode=UPSERT`.

Expected success: `200`, validation result plus `summary.rowsRead`, `rowsImported`, `rowsUpdated`, `rowsFailed`, `executionTimeMs`.

Expected failure: `mode=BAD` returns `422`; invalid workbook returns `200` with failed validation data and import job status `FAILED_VALIDATION`.

Mode testing: compare `INSERT_ONLY` and `UPSERT` on the same workbook.

### 16 Dashboard

Call as ADMIN and as restricted users:

- `GET /dashboard/summary`
- `GET /dashboard/equipment-summary`
- `GET /dashboard/hierarchy-summary`
- `GET /dashboard/equipment-distribution?discomId={{discomId}}`
- `GET /dashboard/substation-status`
- `GET /dashboard/transformer-capacity`
- `GET /dashboard/feeder-load`
- `GET /dashboard/import-history?dateFrom=2026-07-01&dateTo=2026-07-08`
- `GET /dashboard/recent-import-errors`
- `GET /dashboard/map`

Expected success: `200`, scoped data only.

Validation testing: invalid `dateFrom` or `dateTo` returns `422`.

### 17 Reports

Call JSON reports:

- `GET /reports/substations?format=json`
- `GET /reports/transformers?format=json`
- `GET /reports/feeders?format=json`
- `GET /reports/equipment-summary?format=json`
- `GET /reports/import-history?format=json`
- `GET /reports/import-errors?format=json`
- `GET /reports/audit-log?format=json`

Call file exports:

- `GET /reports/substations?format=xlsx`
- `GET /reports/substations/pdf`
- `GET /reports/transformers/pdf`
- `GET /reports/feeders/pdf`
- `GET /reports/equipment-summary/pdf`

Expected success: JSON returns envelope; XLSX returns spreadsheet content type; PDF returns `application/pdf`.

Validation testing: `format=csv`, invalid date, invalid number, and `isActive=yes` return `422`.

Role testing: all roles can read reports, scoped to assigned areas.
