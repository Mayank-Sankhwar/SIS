# Project Architecture

## Folder Structure

```text
backend/
  prisma/
    schema.prisma
    migrations/
    manual-migrations/
    seed.ts
  postman/
  src/
    app.ts
    server.ts
    config/
    controllers/
    dtos/
    middlewares/
    parsers/
    repositories/
    routes/
    services/
    types/
    utils/
    validators/
```

## Request Flow

```text
HTTP request
  -> Express app
  -> /api/v1 router
  -> route middleware
  -> validator middleware
  -> controller
  -> service
  -> repository
  -> Prisma
  -> PostgreSQL
```

## Repository Pattern

Repositories isolate database access. They use Prisma queries, transactions, selects, soft-delete filters, uniqueness checks, and hierarchy joins. Services call repositories rather than Prisma directly except where a repository is itself the query boundary for dashboards and reports.

Examples:

- `auth.repository.ts`: user lookup for login/profile.
- `authorization.repository.ts`: active user and area hierarchy lookup.
- CRUD repositories: module-specific create/list/get/update/delete queries.
- `import.repository.ts`: upload metadata, import jobs, import errors, and upsert/create operations.
- `dashboard.repository.ts`: aggregate read queries.
- `report.repository.ts`: report row queries and scoped exports.

## Service Layer

Services own business rules:

- Authentication verifies credentials and signs JWTs.
- Authorization checks role and area access.
- User Management enforces reporting hierarchy, primary mappings, duplicate checks, and creator area scope.
- CRUD services validate parent hierarchy state, enforce duplicate handling, and record audit log messages.
- Import service validates file envelope, parses workbooks, validates dependencies, processes rows, and records import summaries.
- Dashboard and report services format query results for API output or export.

## Controller Layer

Controllers translate HTTP request data into service calls and return response envelopes through `sendSuccess`.

Controllers do not contain database access. They handle:

- Current user checks.
- Request parsing for query/body/file data.
- Response message selection.
- File response headers for XLSX and PDF reports.

## Middleware

Key middleware:

- `authenticate`: reads `Authorization: Bearer <token>`, verifies JWT, loads active user.
- `authorizeRoles`: checks allowed roles, with ADMIN bypass.
- `checkAreaAccess`: validates requested area against user assignments.
- `validateBody`, `validateQuery`, `validateParams`: Zod validation.
- `importWorkbookUpload`: Multer upload handling for workbook import.
- `errorMiddleware`: central error response handling.
- `notFoundMiddleware`: unknown route handling.

## Authentication Flow

1. Client calls `POST /api/v1/auth/login`.
2. Auth service finds user by lowercased email.
3. Service rejects missing, inactive, deleted, or wrong-password users.
4. Service signs JWT with `sub`, `email`, and role.
5. Client sends token as `Authorization: Bearer <token>`.
6. `authenticate` verifies token and loads active user data into `req.user`.

## Authorization Flow

Role flow:

1. Route declares allowed roles with `authorizeRoles`.
2. Missing user returns `401`.
3. ADMIN is allowed automatically.
4. Other roles must be listed on the route.

Area flow:

1. `checkAreaAccess` reads area identifiers from params, query, or body.
2. It resolves the full hierarchy for the requested area.
3. It loads active user area mappings.
4. Access is granted if one assignment covers the requested hierarchy.
5. Otherwise, request returns `403`.

## Excel Import Flow

Validation:

```text
Upload file
  -> validate extension and size
  -> checksum
  -> create UploadedFile
  -> create ImportJob
  -> parse workbook
  -> validate sheets/headers/rows
  -> create ImportError rows
  -> update ImportJob status
```

Import:

```text
Validate workbook
  -> if invalid, return validation result
  -> parse workbook
  -> process rows in parent-first order
  -> UPSERT or INSERT_ONLY
  -> collect row errors
  -> create ImportError rows
  -> update ImportJob status
```

## Dashboard Flow

Dashboard endpoints:

1. Read authenticated user and role.
2. Build scoped Prisma where clauses.
3. Apply hierarchy and date filters where supported.
4. Run aggregate/count queries.
5. Return JSON summaries.

Dashboard data is read-only.

## Report Flow

Report endpoints:

1. Read authenticated user and role.
2. Parse report filters and format.
3. Query scoped report rows.
4. Return JSON, XLSX, or PDF.

PDF reports include title, generation timestamp, applied filters, hierarchy information, headers, page numbers, and footer.

Audit log report is built from existing created/updated/deleted metadata for supported substation and equipment records.
