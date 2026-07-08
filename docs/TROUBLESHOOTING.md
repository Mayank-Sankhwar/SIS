# Troubleshooting

## Database Connection

Symptoms:

- Server fails on startup.
- Prisma cannot connect.
- Requests return `500`.

Checks:

- Confirm `DATABASE_URL` is set.
- Confirm PostgreSQL is running.
- Confirm network access and credentials.
- Run `npm run prisma:validate`.

## Migration Errors

Symptoms:

- `prisma migrate deploy` fails.
- Missing tables or columns.

Fixes:

- Confirm database matches the intended environment.
- Run migrations from `backend`.
- Check `backend/prisma/migrations`.
- Apply required manual migrations from `backend/prisma/manual-migrations` if your deployment requires them.
- Do not use `migrate reset` in production.

## JWT Errors

Symptoms:

- `Missing or invalid authorization header`.
- `Invalid or expired token`.
- `User account is inactive`.

Fixes:

- Send header as `Authorization: Bearer <token>`.
- Log in again if token expired.
- Check `JWT_SECRET` is unchanged between login and API call.
- Confirm user is active and not deleted.

## Validation Errors

Symptoms:

- API returns `422`.

Common causes:

- Invalid UUID path or query parameter.
- Empty required string.
- `limit` greater than `100`.
- Invalid `sortBy`.
- Boolean query is not `true` or `false`.
- Negative or zero values where positive values are required.
- Future commissioning or installation date.
- Extra unknown fields in strict body schemas for substation/equipment.

Fix:

- Compare payload against `docs/API_REFERENCE.md`.

## Excel Upload Errors

Symptoms:

- `Workbook file is required`.
- `Only .xlsx workbook files are supported`.
- `Workbook file size must not exceed 10 MB`.

Fixes:

- Use multipart/form-data.
- Set form key `file` to type File.
- Upload a `.xlsx` file.
- Keep file size at or below 10 MB.

## Import Errors

Symptoms:

- Validation result contains `validationErrors`.
- Import job status is `FAILED_VALIDATION` or `COMPLETED_WITH_ERRORS`.

Common causes:

- Missing required sheet.
- Header name mismatch.
- Header order mismatch.
- Missing parent code.
- Duplicate natural key in workbook.
- Required cell empty.
- Invalid number/date/coordinate.

Fix:

- Use `docs/EXCEL_IMPORT_GUIDE.md`.
- Correct workbook sheets and headers exactly.
- Ensure parent rows appear before child references can be resolved.
- Use `UPSERT` when updating existing records.

## Prisma Errors

Symptoms:

- Unique constraint errors.
- Foreign key errors.
- Client generation errors.

Fixes:

- Run `npm run prisma:generate` after schema/migration changes.
- Check unique keys documented in `docs/DATABASE.md`.
- Ensure parent records exist and are active.
- Use application endpoints rather than direct table writes.

## Permission Errors

Symptoms:

- `You are not allowed to perform this action`.
- `You do not have access to this area`.
- `Requested area was not found`.

Fixes:

- Confirm role is allowed for the endpoint.
- Confirm user has active `UserAreaMapping`.
- Confirm request area id belongs under the user's assigned area.
- ADMIN bypasses area checks; EE/AE/JE do not.

## Report Export Issues

Symptoms:

- XLSX/PDF does not download.
- `format must be json, xlsx, or pdf`.

Fixes:

- Use `format=json`, `format=xlsx`, or `format=pdf`.
- For dedicated PDF endpoints, do not pass `format`.
- Confirm token is valid.
- Check date and number filters.

## Dashboard Empty Data

Symptoms:

- Dashboard returns zeros or empty arrays.

Common causes:

- User has no active area mappings.
- Requested hierarchy filter is outside user scope.
- Data is soft-deleted.
- Map endpoint only returns active substations with latitude and longitude.

## Server Startup Issues

Checks:

- `npm install` or `npm ci` completed.
- `.env` exists in `backend`.
- `JWT_SECRET` has at least 32 characters.
- `DATABASE_URL` is valid URL format.
- Port is available.

Commands:

```bash
cd backend
npm run build
npm run prisma:validate
npm run lint
npm run dev
```
