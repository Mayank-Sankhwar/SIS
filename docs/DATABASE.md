# Database

The backend uses Prisma ORM with PostgreSQL. The Prisma schema is located at `backend/prisma/schema.prisma`.

## Prisma Schema

Key enums:

- `RoleName`: `ADMIN`, `EE`, `AE`, `JE`
- `AreaType`: `DISCOM`, `ZONE`, `VERTICAL`, `SUB_VERTICAL`, `SUBSTATION`
- `ImportJobStatus`: `PENDING`, `VALIDATING`, `FAILED_VALIDATION`, `PROCESSING`, `COMPLETED`, `COMPLETED_WITH_ERRORS`, `FAILED`
- `ImportType`: hierarchy and equipment import entity types

## Entity Relationships

Primary hierarchy:

```text
Discom
  -> Zone
    -> Vertical
      -> SubVertical
        -> Substation
          -> IncomingSource
          -> OutgoingFeeder
          -> Transformer
          -> LightningArrester
          -> BatteryBank
          -> CapacitorBank
```

User relationships:

- `Role` has many `User`.
- `User` can have a `parentUser`.
- `UserAreaMapping` assigns each user to exactly one area per mapping.
- Area mappings can target Discom, Zone, Vertical, SubVertical, or Substation.

Import relationships:

- `UploadedFile` records workbook metadata.
- `ImportJob` belongs to an uploaded file and creator.
- `ImportError` belongs to an import job.

Audit metadata:

- Most domain tables include `createdById`, `updatedById`, `deletedById`, `createdAt`, `updatedAt`, and `deletedAt`.
- Soft delete is represented by non-null `deletedAt`.

## Constraints

The schema defines unique and indexed fields for hierarchy and equipment natural keys. Examples:

- Discom: unique `name`, unique `code`.
- Zone: unique `discomId + name`, unique `discomId + code`.
- Vertical: unique `zoneId + name`, unique `zoneId + code`.
- SubVertical: unique `verticalId + name`, unique `verticalId + code`.
- Substation: unique `subVerticalId + name`, unique `subVerticalId + code`.
- Incoming Source: unique `substationId + sourceName`.
- Transformer: unique `substationId + transformerCode`, unique `serialNumber`.
- Outgoing Feeder: unique `substationId + feederName`, unique `substationId + feederCode`.
- Lightning Arrester: unique `substationId + arresterCode`, unique `serialNumber`.
- Battery Bank: unique `substationId + batteryBankCode`.
- Capacitor Bank: unique `substationId + capacitorBankCode`.

Manual migration notes include database-level checks that Prisma cannot fully model, including area mapping consistency and non-negative import counts.

## Migration Workflow

Validate schema:

```bash
cd backend
npm run prisma:validate
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Apply migrations in production:

```bash
npx prisma migrate deploy
```

Create/apply migrations in development:

```bash
npx prisma migrate dev
```

Manual SQL migrations live in `backend/prisma/manual-migrations/` and should be applied intentionally when required by deployment policy.

## Seed Workflow

Run:

```bash
cd backend
npm run prisma:seed
```

Seed creates:

- Roles.
- Super admin.
- Sample Discom, Zones, Verticals, SubVerticals, Substations.
- EE, AE, and JE users with mapped areas.
- Sample equipment.
- Sample uploaded file, import job, and import errors.

Default login:

```text
Email: super.admin@sis.gov.in
Password: Password@123
```

## Reset Database

Development reset:

```bash
cd backend
npx prisma migrate reset
```

This drops data, reapplies migrations, and runs seed if configured. Do not use against production.

Production recovery should use backups and controlled migrations, not `migrate reset`.
