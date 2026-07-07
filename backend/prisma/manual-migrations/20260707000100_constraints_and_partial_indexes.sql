-- PostgreSQL constraints and partial indexes not expressible in Prisma schema.
-- Execute this after prisma/migrations/20260707000000_initial_production_schema/migration.sql.

ALTER TABLE "user_area_mappings"
ADD CONSTRAINT "chk_user_area_mappings_exactly_one_area"
CHECK (
  num_nonnulls("discom_id", "zone_id", "vertical_id", "sub_vertical_id", "substation_id") = 1
);

ALTER TABLE "user_area_mappings"
ADD CONSTRAINT "chk_user_area_mappings_area_type_matches_fk"
CHECK (
  (
    "area_type" = 'DISCOM'
    AND "discom_id" IS NOT NULL
    AND "zone_id" IS NULL
    AND "vertical_id" IS NULL
    AND "sub_vertical_id" IS NULL
    AND "substation_id" IS NULL
  )
  OR (
    "area_type" = 'ZONE'
    AND "zone_id" IS NOT NULL
    AND "discom_id" IS NULL
    AND "vertical_id" IS NULL
    AND "sub_vertical_id" IS NULL
    AND "substation_id" IS NULL
  )
  OR (
    "area_type" = 'VERTICAL'
    AND "vertical_id" IS NOT NULL
    AND "discom_id" IS NULL
    AND "zone_id" IS NULL
    AND "sub_vertical_id" IS NULL
    AND "substation_id" IS NULL
  )
  OR (
    "area_type" = 'SUB_VERTICAL'
    AND "sub_vertical_id" IS NOT NULL
    AND "discom_id" IS NULL
    AND "zone_id" IS NULL
    AND "vertical_id" IS NULL
    AND "substation_id" IS NULL
  )
  OR (
    "area_type" = 'SUBSTATION'
    AND "substation_id" IS NOT NULL
    AND "discom_id" IS NULL
    AND "zone_id" IS NULL
    AND "vertical_id" IS NULL
    AND "sub_vertical_id" IS NULL
  )
);

ALTER TABLE "users"
ADD CONSTRAINT "chk_users_parent_user_not_self"
CHECK ("parent_user_id" IS NULL OR "parent_user_id" <> "id");

ALTER TABLE "import_jobs"
ADD CONSTRAINT "chk_import_jobs_row_counts_non_negative"
CHECK ("total_rows" >= 0 AND "success_rows" >= 0 AND "failed_rows" >= 0);

CREATE UNIQUE INDEX "uq_user_area_mappings_one_primary_active_user"
ON "user_area_mappings" ("user_id")
WHERE "is_primary" = true
  AND "is_active" = true
  AND "deleted_at" IS NULL;

-- Optional business rule only if exactly one active battery bank is allowed per substation.
-- CREATE UNIQUE INDEX "uq_battery_banks_one_active_per_substation"
-- ON "battery_banks" ("substation_id")
-- WHERE "is_active" = true
--   AND "deleted_at" IS NULL;

-- Optional business rule only if exactly one active capacitor bank is allowed per substation.
-- CREATE UNIQUE INDEX "uq_capacitor_banks_one_active_per_substation"
-- ON "capacitor_banks" ("substation_id")
-- WHERE "is_active" = true
--   AND "deleted_at" IS NULL;
