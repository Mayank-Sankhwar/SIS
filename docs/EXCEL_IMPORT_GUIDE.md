# Excel Import Guide

The import engine supports a Substation Information System workbook in `.xlsx` format. Maximum file size is 10 MB.

## Endpoints

- `POST /api/v1/imports/validate`: validates workbook and stores upload/import job metadata. No master data is inserted.
- `POST /api/v1/imports`: validates and imports workbook.

Allowed roles: `ADMIN`, `EE`, `AE`.

## Workbook Format

The workbook must contain the required sheets below. Header order is enforced for every sheet.

## Required Sheets and Headers

| Sheet | Headers |
|---|---|
| `Discoms` | `Name`, `Code` |
| `Zones` | `Discom Code`, `Name`, `Code` |
| `Verticals` | `Zone Code`, `Name`, `Code` |
| `Sub Verticals` | `Vertical Code`, `Name`, `Code` |
| `Substations` | `Sub Vertical Code`, `Name`, `Code`, `Voltage Level KV`, `Address`, `Latitude`, `Longitude`, `Commissioning Date`, `Is Active` |
| `Incoming Sources` | `Substation Code`, `Source Name`, `Source Type`, `Voltage Level KV`, `Feeder Name`, `Meter Number`, `Is Active` |
| `Outgoing Feeders` | `Substation Code`, `Feeder Name`, `Feeder Code`, `Voltage Level KV`, `Feeder Type`, `Connected Load MW`, `Is Active` |
| `Transformers` | `Substation Code`, `Transformer Code`, `Capacity MVA`, `Primary Voltage KV`, `Secondary Voltage KV`, `Make`, `Serial Number`, `Commissioning Date`, `Is Active` |
| `Lightning Arresters` | `Substation Code`, `Arrester Code`, `Location Description`, `Voltage Rating KV`, `Make`, `Serial Number`, `Installation Date`, `Is Active` |
| `Battery Banks` | `Substation Code`, `Battery Bank Code`, `Battery Type`, `Voltage V`, `Capacity Ah`, `Cell Count`, `Make`, `Installation Date`, `Is Active` |
| `Capacitor Banks` | `Substation Code`, `Capacitor Bank Code`, `Capacity MVAR`, `Voltage Level KV`, `Steps Count`, `Make`, `Installation Date`, `Is Active` |

## Validation Process

The validation endpoint:

1. Requires a `.xlsx` file.
2. Rejects files larger than 10 MB.
3. Computes SHA-256 checksum.
4. Creates `UploadedFile` metadata.
5. Creates an `ImportJob`.
6. Parses workbook sheets.
7. Checks required sheets.
8. Checks required headers and header order.
9. Reports missing columns, extra columns, validation errors, and warnings.
10. Stores validation errors in `ImportError`.

Empty files return validation result with error code `EMPTY_FILE`.

## Import Process

The import endpoint performs validation first. If validation fails, it returns a successful HTTP response with failed validation data and an import job status of `FAILED_VALIDATION`.

If validation succeeds, the processor imports in dependency order:

1. Discoms.
2. Zones.
3. Verticals.
4. Sub Verticals.
5. Substations.
6. Incoming Sources.
7. Transformers.
8. Outgoing Feeders.
9. Lightning Arresters.
10. Battery Banks.
11. Capacitor Banks.

This order ensures parent records exist before child records are resolved.

## UPSERT

`UPSERT` is the default mode.

Behavior:

- Existing records are updated by natural keys.
- Deleted records are restored by clearing deleted metadata in repository upsert operations.
- New records are inserted.
- `rowsUpdated` and `rowsImported` are counted in the response summary.

## INSERT_ONLY

`INSERT_ONLY` creates missing records and skips existing records.

Behavior:

- Existing records are detected by natural keys.
- Missing records are inserted.
- Existing records are not updated.

## Natural Keys

- Discom: `code`.
- Zone: `discomId + code`.
- Vertical: `zoneId + code`.
- SubVertical: `verticalId + code`.
- Substation: `subVerticalId + code`.
- Incoming Source: `substationId + sourceName`.
- Transformer: `substationId + transformerCode`.
- Outgoing Feeder: `substationId + feederName`.
- Lightning Arrester: `substationId + arresterCode`.
- Battery Bank: `substationId + batteryBankCode`.
- Capacitor Bank: `substationId + capacitorBankCode`.

## Common Errors

| Error | Meaning | Fix |
|---|---|---|
| `EMPTY_FILE` | Workbook has no readable content | Upload a valid `.xlsx` |
| `MISSING_PARENT` | Referenced parent code was not found | Add parent row or fix code |
| `REQUIRED_FIELD` | Required value is missing | Fill required cell |
| `INVALID_DECIMAL` | Numeric value is not valid | Use number only |
| `INVALID_COORDINATE` | Latitude/longitude invalid | Use valid decimal coordinates |
| Duplicate row error | Duplicate natural key in workbook | Remove or correct duplicate |
| Missing sheet | Required sheet is absent | Add sheet with exact name |
| Missing column | Required header is absent | Add exact header |
| Header order invalid | Columns are out of order | Match documented order |

## Response Shape

Validation response includes:

- `isValid`
- `workbookSummary`
- `sheetNames`
- `sheets`
- `validationErrors`
- `validationWarnings`
- `uploadedFile`
- `importJob`

Import response also includes:

- `mode`
- `summary.rowsRead`
- `summary.rowsImported`
- `summary.rowsUpdated`
- `summary.rowsFailed`
- `summary.validationErrors`
- `summary.executionTimeMs`
