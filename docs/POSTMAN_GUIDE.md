# Postman Guide

Postman collections are stored in `backend/postman`.

## Collections

- `battery-bank.postman_collection.json`
- `capacitor-bank.postman_collection.json`
- `dashboard-phase1.postman_collection.json`
- `dashboard-phase2.postman_collection.json`
- `excel-import-infrastructure.postman_collection.json`
- `incoming-source.postman_collection.json`
- `lightning-arrester.postman_collection.json`
- `outgoing-feeder.postman_collection.json`
- `report-phase1.postman_collection.json`
- `report-phase2.postman_collection.json`
- `substation-phase-1.postman_collection.json`
- `substation-phase-2.postman_collection.json`
- `substation-phase-3.postman_collection.json`
- `transformer.postman_collection.json`

## Import Collections

1. Open Postman.
2. Select Import.
3. Choose the collection JSON files from `backend/postman`.
4. Import them into one workspace.

## Environment Variables

Create a Postman environment with:

| Variable | Purpose |
|---|---|
| `baseUrl` | Usually `http://localhost:3000` |
| `token` | Bearer token from `/api/v1/auth/login` |
| `restrictedToken` | Token for EE/AE/JE area-scope testing |
| `discomId` | Existing Discom UUID |
| `zoneId` | Existing Zone UUID |
| `verticalId` | Existing Vertical UUID |
| `subVerticalId` | Existing SubVertical UUID |
| `substationId` | Existing Substation UUID |
| `outsideAreaSubstationId` | Substation outside a restricted user's scope |
| `dateFrom` | Optional date filter |
| `dateTo` | Optional date filter |

## Authorization

1. Run login.
2. Copy `data.accessToken`.
3. Set `token`.
4. Requests use `Authorization: Bearer {{token}}`.

For restricted role tests, log in as an EE/AE/JE seed user and set `restrictedToken`.

## Testing Order

1. Login.
2. Users.
3. Discom.
4. Zone.
5. Vertical.
6. SubVertical.
7. Substation.
8. Incoming Sources.
9. Outgoing Feeders.
10. Transformers.
11. Lightning Arresters.
12. Battery Banks.
13. Capacitor Banks.
14. Excel Validation.
15. Excel Import.
16. Dashboard.
17. Reports.

## File Upload Requests

For `/api/v1/imports/validate` and `/api/v1/imports`:

- Body type: `form-data`.
- Key `file`: type `File`.
- Key `mode`: text, optional, `UPSERT` or `INSERT_ONLY`.
- Do not manually set `Content-Type`; Postman will add the multipart boundary.

## Response Checks

- JSON endpoints return `success: true`.
- Create endpoints return `201`.
- Protected endpoints without token return `401`.
- Role-denied endpoints return `403`.
- Duplicate creates return `409`.
- Invalid request data returns `422`.
- XLSX reports return spreadsheet content type.
- PDF reports return `application/pdf`.
