# Deployment

## Environment Variables

Required:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace-with-at-least-32-characters
```

Optional/defaulted:

```env
NODE_ENV=production
PORT=3000
JWT_EXPIRES_IN=1h
CORS_ORIGIN=*
LOG_FORMAT=combined
UPLOAD_MAX_FILE_SIZE_MB=10
```

`JWT_SECRET` must be at least 32 characters.

## Install Dependencies

```bash
cd backend
npm ci
```

## Validate Configuration

```bash
npm run prisma:validate
```

## Production Build

```bash
npm run build
```

The compiled output is written to `backend/dist`.

## Migration

```bash
npx prisma migrate deploy
```

Apply any required manual SQL migrations according to your database change process.

## Seed

Seed only when the target environment needs bootstrap data:

```bash
npm run prisma:seed
```

Do not run seed on a production database unless the seed data is intended and reviewed.

## Start Server

```bash
npm start
```

The app listens on `PORT` and mounts APIs under `/api/v1`.

## Production Checklist

- PostgreSQL is reachable from the application host.
- `DATABASE_URL` points to the correct database.
- `JWT_SECRET` is strong and not shared with non-production.
- `NODE_ENV=production`.
- `CORS_ORIGIN` is restricted to approved frontend origins.
- Migrations have been applied.
- Prisma client has been generated during install/build.
- Upload size policy matches `UPLOAD_MAX_FILE_SIZE_MB`.
- Logs are captured by the process manager or platform.
- Health endpoint is reachable at `/api/v1/health`.
- Backup and rollback procedures are documented.
- Seed credentials are removed or rotated if seed is used outside development.
