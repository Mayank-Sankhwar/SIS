# Clean Node Backend

Production-ready Node.js backend scaffold using Express, TypeScript, Prisma, PostgreSQL, JWT authentication helpers, bcrypt, dotenv, Helmet, CORS, Morgan, Express Validator, Multer, ExcelJS, and Zod.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

## Health Check

```http
GET /api/v1/health
```

## Notes

- Prisma is configured for PostgreSQL in `prisma/schema.prisma`.
- No Prisma models are defined, so this scaffold does not create any database tables.
- JWT, bcrypt, upload, validation, and error-handling utilities are included for feature modules to use.
