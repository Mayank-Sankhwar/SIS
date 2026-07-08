# Substation Info System Backend

Substation Info System is a production-oriented Node.js backend for managing electrical distribution hierarchy, substation assets, Excel workbook imports, dashboard analytics, and operational reports.

## Features

- JWT authentication and profile lookup.
- Role-based authorization for `ADMIN`, `EE`, `AE`, and `JE`.
- Area-scoped access using `DISCOM`, `ZONE`, `VERTICAL`, `SUB_VERTICAL`, and `SUBSTATION` mappings.
- User creation with reporting hierarchy and primary area assignment.
- CRUD APIs for Discom, Zone, Vertical, SubVertical, Substation, Incoming Sources, Outgoing Feeders, Transformers, Lightning Arresters, Battery Banks, and Capacitor Banks.
- Soft delete support for operational master data.
- Excel workbook validation and import for the full substation information model.
- Dashboard summary, hierarchy, equipment, map, import history, and import error APIs.
- JSON, XLSX, PDF, import history, import error, and audit-style reports.
- Prisma schema, migrations, seed data, and Postman collections.

## Architecture Overview

The backend follows a layered Express architecture:

- Routes map HTTP endpoints to middleware and controllers.
- Controllers parse request context and return API responses.
- Services enforce business rules and orchestration.
- Repositories isolate Prisma database access.
- Validators use Zod or express-validator for input validation.
- Middleware handles authentication, authorization, validation, upload parsing, errors, and 404s.

## Tech Stack

- Node.js 20+
- Express 4
- TypeScript with `NodeNext`
- Prisma ORM
- PostgreSQL
- Zod
- JWT
- Multer for workbook upload
- ExcelJS for workbook exports
- ESLint

## Folder Structure

```text
Substation_Info_System/
  backend/
    prisma/
      schema.prisma
      migrations/
      manual-migrations/
      seed.ts
    postman/
    src/
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
    package.json
  docs/
```

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create `backend/.env`.

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace-with-at-least-32-characters
JWT_EXPIRES_IN=1h
CORS_ORIGIN=*
LOG_FORMAT=combined
UPLOAD_MAX_FILE_SIZE_MB=10
```

## Database Setup

Create a PostgreSQL database and set `DATABASE_URL`.

```bash
cd backend
npm run prisma:validate
npm run prisma:generate
```

## Migration

```bash
cd backend
npx prisma migrate deploy
```

For local development, use:

```bash
npx prisma migrate dev
```

## Seed

```bash
cd backend
npm run prisma:seed
```

Seed credentials:

- Admin email: `super.admin@sis.gov.in`
- Default password: `Password@123`

The seed also creates sample hierarchy, users, substations, equipment, uploaded file metadata, import job history, and import errors.

## Run Project

Development:

```bash
cd backend
npm run dev
```

Production build:

```bash
cd backend
npm run build
npm start
```

Base URL:

```text
http://localhost:3000/api/v1
```

## Documentation

- [API Reference](docs/API_REFERENCE.md)
- [API Testing Guide](docs/API_TESTING_GUIDE.md)
- [Database](docs/DATABASE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Postman Guide](docs/POSTMAN_GUIDE.md)
- [Excel Import Guide](docs/EXCEL_IMPORT_GUIDE.md)
- [Role Permission Matrix](docs/ROLE_PERMISSION_MATRIX.md)
- [Project Architecture](docs/PROJECT_ARCHITECTURE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
