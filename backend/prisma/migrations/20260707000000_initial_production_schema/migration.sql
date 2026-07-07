-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'EE', 'AE', 'JE');

-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('DISCOM', 'ZONE', 'VERTICAL', 'SUB_VERTICAL', 'SUBSTATION');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('PENDING', 'VALIDATING', 'FAILED_VALIDATION', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('DISCOM', 'ZONE', 'VERTICAL', 'SUB_VERTICAL', 'SUBSTATION', 'INCOMING_SOURCE', 'OUTGOING_FEEDER', 'TRANSFORMER', 'LIGHTNING_ARRESTER', 'BATTERY_BANK', 'CAPACITOR_BANK');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "parent_user_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mobile_number" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_area_mappings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "area_type" "AreaType" NOT NULL,
    "discom_id" UUID,
    "zone_id" UUID,
    "vertical_id" UUID,
    "sub_vertical_id" UUID,
    "substation_id" UUID,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_area_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discoms" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "discoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" UUID NOT NULL,
    "discom_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verticals" (
    "id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "verticals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_verticals" (
    "id" UUID NOT NULL,
    "vertical_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sub_verticals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substations" (
    "id" UUID NOT NULL,
    "sub_vertical_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "voltage_level_kv" DECIMAL(8,2) NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "commissioning_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "substations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incoming_sources" (
    "id" UUID NOT NULL,
    "substation_id" UUID NOT NULL,
    "source_name" VARCHAR(150) NOT NULL,
    "source_type" VARCHAR(50),
    "voltage_level_kv" DECIMAL(8,2) NOT NULL,
    "feeder_name" VARCHAR(150),
    "meter_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "incoming_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transformers" (
    "id" UUID NOT NULL,
    "substation_id" UUID NOT NULL,
    "transformer_code" VARCHAR(100) NOT NULL,
    "capacity_mva" DECIMAL(10,2) NOT NULL,
    "primary_voltage_kv" DECIMAL(8,2) NOT NULL,
    "secondary_voltage_kv" DECIMAL(8,2) NOT NULL,
    "make" VARCHAR(150),
    "serial_number" VARCHAR(150),
    "commissioning_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "transformers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outgoing_feeders" (
    "id" UUID NOT NULL,
    "substation_id" UUID NOT NULL,
    "feeder_name" VARCHAR(150) NOT NULL,
    "feeder_code" VARCHAR(100),
    "voltage_level_kv" DECIMAL(8,2) NOT NULL,
    "feeder_type" VARCHAR(50),
    "connected_load_mw" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "outgoing_feeders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lightning_arresters" (
    "id" UUID NOT NULL,
    "substation_id" UUID NOT NULL,
    "arrester_code" VARCHAR(100) NOT NULL,
    "location_description" VARCHAR(255),
    "voltage_rating_kv" DECIMAL(8,2) NOT NULL,
    "make" VARCHAR(150),
    "serial_number" VARCHAR(150),
    "installation_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lightning_arresters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battery_banks" (
    "id" UUID NOT NULL,
    "substation_id" UUID NOT NULL,
    "battery_bank_code" VARCHAR(100) NOT NULL,
    "battery_type" VARCHAR(100),
    "voltage_v" DECIMAL(8,2) NOT NULL,
    "capacity_ah" DECIMAL(10,2) NOT NULL,
    "cell_count" INTEGER,
    "make" VARCHAR(150),
    "installation_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "battery_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacitor_banks" (
    "id" UUID NOT NULL,
    "substation_id" UUID NOT NULL,
    "capacitor_bank_code" VARCHAR(100) NOT NULL,
    "capacity_mvar" DECIMAL(10,2) NOT NULL,
    "voltage_level_kv" DECIMAL(8,2) NOT NULL,
    "steps_count" INTEGER,
    "make" VARCHAR(150),
    "installation_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "capacitor_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" UUID NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "stored_file_name" VARCHAR(255) NOT NULL,
    "storage_path" TEXT NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "checksum" VARCHAR(128) NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "deleted_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" UUID NOT NULL,
    "uploaded_file_id" UUID NOT NULL,
    "import_type" "ImportType" NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'PENDING',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "success_rows" INTEGER NOT NULL DEFAULT 0,
    "failed_rows" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_errors" (
    "id" UUID NOT NULL,
    "import_job_id" UUID NOT NULL,
    "sheet_name" VARCHAR(150),
    "row_number" INTEGER NOT NULL,
    "column_name" VARCHAR(150),
    "field_name" VARCHAR(150),
    "raw_value" TEXT,
    "error_code" VARCHAR(100) NOT NULL,
    "error_message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_number_key" ON "users"("mobile_number");

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "idx_users_parent_user_id" ON "users"("parent_user_id");

-- CreateIndex
CREATE INDEX "idx_users_is_active" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_users_created_by" ON "users"("created_by");

-- CreateIndex
CREATE INDEX "idx_users_updated_by" ON "users"("updated_by");

-- CreateIndex
CREATE INDEX "idx_users_deleted_by" ON "users"("deleted_by");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_user_id" ON "user_area_mappings"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_area_type" ON "user_area_mappings"("area_type");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_discom_id" ON "user_area_mappings"("discom_id");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_zone_id" ON "user_area_mappings"("zone_id");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_vertical_id" ON "user_area_mappings"("vertical_id");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_sub_vertical_id" ON "user_area_mappings"("sub_vertical_id");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_substation_id" ON "user_area_mappings"("substation_id");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_is_active" ON "user_area_mappings"("is_active");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_deleted_at" ON "user_area_mappings"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_created_by" ON "user_area_mappings"("created_by");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_updated_by" ON "user_area_mappings"("updated_by");

-- CreateIndex
CREATE INDEX "idx_user_area_mappings_deleted_by" ON "user_area_mappings"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_area_mappings_user_id_discom_id" ON "user_area_mappings"("user_id", "discom_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_area_mappings_user_id_zone_id" ON "user_area_mappings"("user_id", "zone_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_area_mappings_user_id_vertical_id" ON "user_area_mappings"("user_id", "vertical_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_area_mappings_user_id_sub_vertical_id" ON "user_area_mappings"("user_id", "sub_vertical_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_area_mappings_user_id_substation_id" ON "user_area_mappings"("user_id", "substation_id");

-- CreateIndex
CREATE UNIQUE INDEX "discoms_name_key" ON "discoms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "discoms_code_key" ON "discoms"("code");

-- CreateIndex
CREATE INDEX "idx_discoms_is_active" ON "discoms"("is_active");

-- CreateIndex
CREATE INDEX "idx_discoms_deleted_at" ON "discoms"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_discoms_created_by" ON "discoms"("created_by");

-- CreateIndex
CREATE INDEX "idx_discoms_updated_by" ON "discoms"("updated_by");

-- CreateIndex
CREATE INDEX "idx_discoms_deleted_by" ON "discoms"("deleted_by");

-- CreateIndex
CREATE INDEX "idx_zones_discom_id" ON "zones"("discom_id");

-- CreateIndex
CREATE INDEX "idx_zones_is_active" ON "zones"("is_active");

-- CreateIndex
CREATE INDEX "idx_zones_deleted_at" ON "zones"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_zones_created_by" ON "zones"("created_by");

-- CreateIndex
CREATE INDEX "idx_zones_updated_by" ON "zones"("updated_by");

-- CreateIndex
CREATE INDEX "idx_zones_deleted_by" ON "zones"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_zones_discom_id_name" ON "zones"("discom_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_zones_discom_id_code" ON "zones"("discom_id", "code");

-- CreateIndex
CREATE INDEX "idx_verticals_zone_id" ON "verticals"("zone_id");

-- CreateIndex
CREATE INDEX "idx_verticals_is_active" ON "verticals"("is_active");

-- CreateIndex
CREATE INDEX "idx_verticals_deleted_at" ON "verticals"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_verticals_created_by" ON "verticals"("created_by");

-- CreateIndex
CREATE INDEX "idx_verticals_updated_by" ON "verticals"("updated_by");

-- CreateIndex
CREATE INDEX "idx_verticals_deleted_by" ON "verticals"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_verticals_zone_id_name" ON "verticals"("zone_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_verticals_zone_id_code" ON "verticals"("zone_id", "code");

-- CreateIndex
CREATE INDEX "idx_sub_verticals_vertical_id" ON "sub_verticals"("vertical_id");

-- CreateIndex
CREATE INDEX "idx_sub_verticals_is_active" ON "sub_verticals"("is_active");

-- CreateIndex
CREATE INDEX "idx_sub_verticals_deleted_at" ON "sub_verticals"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_sub_verticals_created_by" ON "sub_verticals"("created_by");

-- CreateIndex
CREATE INDEX "idx_sub_verticals_updated_by" ON "sub_verticals"("updated_by");

-- CreateIndex
CREATE INDEX "idx_sub_verticals_deleted_by" ON "sub_verticals"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_sub_verticals_vertical_id_name" ON "sub_verticals"("vertical_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_sub_verticals_vertical_id_code" ON "sub_verticals"("vertical_id", "code");

-- CreateIndex
CREATE INDEX "idx_substations_sub_vertical_id" ON "substations"("sub_vertical_id");

-- CreateIndex
CREATE INDEX "idx_substations_voltage_level_kv" ON "substations"("voltage_level_kv");

-- CreateIndex
CREATE INDEX "idx_substations_is_active" ON "substations"("is_active");

-- CreateIndex
CREATE INDEX "idx_substations_deleted_at" ON "substations"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_substations_created_by" ON "substations"("created_by");

-- CreateIndex
CREATE INDEX "idx_substations_updated_by" ON "substations"("updated_by");

-- CreateIndex
CREATE INDEX "idx_substations_deleted_by" ON "substations"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_substations_sub_vertical_id_name" ON "substations"("sub_vertical_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_substations_sub_vertical_id_code" ON "substations"("sub_vertical_id", "code");

-- CreateIndex
CREATE INDEX "idx_incoming_sources_substation_id" ON "incoming_sources"("substation_id");

-- CreateIndex
CREATE INDEX "idx_incoming_sources_voltage_level_kv" ON "incoming_sources"("voltage_level_kv");

-- CreateIndex
CREATE INDEX "idx_incoming_sources_is_active" ON "incoming_sources"("is_active");

-- CreateIndex
CREATE INDEX "idx_incoming_sources_deleted_at" ON "incoming_sources"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_incoming_sources_created_by" ON "incoming_sources"("created_by");

-- CreateIndex
CREATE INDEX "idx_incoming_sources_updated_by" ON "incoming_sources"("updated_by");

-- CreateIndex
CREATE INDEX "idx_incoming_sources_deleted_by" ON "incoming_sources"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_incoming_sources_substation_id_source_name" ON "incoming_sources"("substation_id", "source_name");

-- CreateIndex
CREATE UNIQUE INDEX "transformers_serial_number_key" ON "transformers"("serial_number");

-- CreateIndex
CREATE INDEX "idx_transformers_substation_id" ON "transformers"("substation_id");

-- CreateIndex
CREATE INDEX "idx_transformers_capacity_mva" ON "transformers"("capacity_mva");

-- CreateIndex
CREATE INDEX "idx_transformers_is_active" ON "transformers"("is_active");

-- CreateIndex
CREATE INDEX "idx_transformers_deleted_at" ON "transformers"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_transformers_created_by" ON "transformers"("created_by");

-- CreateIndex
CREATE INDEX "idx_transformers_updated_by" ON "transformers"("updated_by");

-- CreateIndex
CREATE INDEX "idx_transformers_deleted_by" ON "transformers"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_transformers_substation_id_transformer_code" ON "transformers"("substation_id", "transformer_code");

-- CreateIndex
CREATE INDEX "idx_outgoing_feeders_substation_id" ON "outgoing_feeders"("substation_id");

-- CreateIndex
CREATE INDEX "idx_outgoing_feeders_voltage_level_kv" ON "outgoing_feeders"("voltage_level_kv");

-- CreateIndex
CREATE INDEX "idx_outgoing_feeders_is_active" ON "outgoing_feeders"("is_active");

-- CreateIndex
CREATE INDEX "idx_outgoing_feeders_deleted_at" ON "outgoing_feeders"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_outgoing_feeders_created_by" ON "outgoing_feeders"("created_by");

-- CreateIndex
CREATE INDEX "idx_outgoing_feeders_updated_by" ON "outgoing_feeders"("updated_by");

-- CreateIndex
CREATE INDEX "idx_outgoing_feeders_deleted_by" ON "outgoing_feeders"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_outgoing_feeders_substation_id_feeder_name" ON "outgoing_feeders"("substation_id", "feeder_name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_outgoing_feeders_substation_id_feeder_code" ON "outgoing_feeders"("substation_id", "feeder_code");

-- CreateIndex
CREATE UNIQUE INDEX "lightning_arresters_serial_number_key" ON "lightning_arresters"("serial_number");

-- CreateIndex
CREATE INDEX "idx_lightning_arresters_substation_id" ON "lightning_arresters"("substation_id");

-- CreateIndex
CREATE INDEX "idx_lightning_arresters_voltage_rating_kv" ON "lightning_arresters"("voltage_rating_kv");

-- CreateIndex
CREATE INDEX "idx_lightning_arresters_is_active" ON "lightning_arresters"("is_active");

-- CreateIndex
CREATE INDEX "idx_lightning_arresters_deleted_at" ON "lightning_arresters"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_lightning_arresters_created_by" ON "lightning_arresters"("created_by");

-- CreateIndex
CREATE INDEX "idx_lightning_arresters_updated_by" ON "lightning_arresters"("updated_by");

-- CreateIndex
CREATE INDEX "idx_lightning_arresters_deleted_by" ON "lightning_arresters"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_lightning_arresters_substation_id_arrester_code" ON "lightning_arresters"("substation_id", "arrester_code");

-- CreateIndex
CREATE INDEX "idx_battery_banks_substation_id" ON "battery_banks"("substation_id");

-- CreateIndex
CREATE INDEX "idx_battery_banks_voltage_v" ON "battery_banks"("voltage_v");

-- CreateIndex
CREATE INDEX "idx_battery_banks_is_active" ON "battery_banks"("is_active");

-- CreateIndex
CREATE INDEX "idx_battery_banks_deleted_at" ON "battery_banks"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_battery_banks_created_by" ON "battery_banks"("created_by");

-- CreateIndex
CREATE INDEX "idx_battery_banks_updated_by" ON "battery_banks"("updated_by");

-- CreateIndex
CREATE INDEX "idx_battery_banks_deleted_by" ON "battery_banks"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_battery_banks_substation_id_battery_bank_code" ON "battery_banks"("substation_id", "battery_bank_code");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_substation_id" ON "capacitor_banks"("substation_id");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_capacity_mvar" ON "capacitor_banks"("capacity_mvar");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_voltage_level_kv" ON "capacitor_banks"("voltage_level_kv");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_is_active" ON "capacitor_banks"("is_active");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_deleted_at" ON "capacitor_banks"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_created_by" ON "capacitor_banks"("created_by");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_updated_by" ON "capacitor_banks"("updated_by");

-- CreateIndex
CREATE INDEX "idx_capacitor_banks_deleted_by" ON "capacitor_banks"("deleted_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_capacitor_banks_substation_id_capacitor_bank_code" ON "capacitor_banks"("substation_id", "capacitor_bank_code");

-- CreateIndex
CREATE INDEX "idx_uploaded_files_uploaded_by" ON "uploaded_files"("uploaded_by");

-- CreateIndex
CREATE INDEX "idx_uploaded_files_deleted_by" ON "uploaded_files"("deleted_by");

-- CreateIndex
CREATE INDEX "idx_uploaded_files_checksum" ON "uploaded_files"("checksum");

-- CreateIndex
CREATE INDEX "idx_uploaded_files_created_at" ON "uploaded_files"("created_at");

-- CreateIndex
CREATE INDEX "idx_uploaded_files_deleted_at" ON "uploaded_files"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_import_jobs_uploaded_file_id" ON "import_jobs"("uploaded_file_id");

-- CreateIndex
CREATE INDEX "idx_import_jobs_status" ON "import_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_import_jobs_import_type" ON "import_jobs"("import_type");

-- CreateIndex
CREATE INDEX "idx_import_jobs_created_by" ON "import_jobs"("created_by");

-- CreateIndex
CREATE INDEX "idx_import_jobs_updated_by" ON "import_jobs"("updated_by");

-- CreateIndex
CREATE INDEX "idx_import_jobs_created_at" ON "import_jobs"("created_at");

-- CreateIndex
CREATE INDEX "idx_import_errors_import_job_id" ON "import_errors"("import_job_id");

-- CreateIndex
CREATE INDEX "idx_import_errors_import_job_id_row_number" ON "import_errors"("import_job_id", "row_number");

-- CreateIndex
CREATE INDEX "idx_import_errors_error_code" ON "import_errors"("error_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_discom_id_fkey" FOREIGN KEY ("discom_id") REFERENCES "discoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_vertical_id_fkey" FOREIGN KEY ("vertical_id") REFERENCES "verticals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_sub_vertical_id_fkey" FOREIGN KEY ("sub_vertical_id") REFERENCES "sub_verticals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_area_mappings" ADD CONSTRAINT "user_area_mappings_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discoms" ADD CONSTRAINT "discoms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discoms" ADD CONSTRAINT "discoms_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discoms" ADD CONSTRAINT "discoms_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_discom_id_fkey" FOREIGN KEY ("discom_id") REFERENCES "discoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verticals" ADD CONSTRAINT "verticals_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verticals" ADD CONSTRAINT "verticals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verticals" ADD CONSTRAINT "verticals_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verticals" ADD CONSTRAINT "verticals_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_verticals" ADD CONSTRAINT "sub_verticals_vertical_id_fkey" FOREIGN KEY ("vertical_id") REFERENCES "verticals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_verticals" ADD CONSTRAINT "sub_verticals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_verticals" ADD CONSTRAINT "sub_verticals_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_verticals" ADD CONSTRAINT "sub_verticals_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_sub_vertical_id_fkey" FOREIGN KEY ("sub_vertical_id") REFERENCES "sub_verticals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_sources" ADD CONSTRAINT "incoming_sources_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_sources" ADD CONSTRAINT "incoming_sources_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_sources" ADD CONSTRAINT "incoming_sources_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_sources" ADD CONSTRAINT "incoming_sources_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transformers" ADD CONSTRAINT "transformers_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transformers" ADD CONSTRAINT "transformers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transformers" ADD CONSTRAINT "transformers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transformers" ADD CONSTRAINT "transformers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_feeders" ADD CONSTRAINT "outgoing_feeders_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_feeders" ADD CONSTRAINT "outgoing_feeders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_feeders" ADD CONSTRAINT "outgoing_feeders_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outgoing_feeders" ADD CONSTRAINT "outgoing_feeders_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lightning_arresters" ADD CONSTRAINT "lightning_arresters_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lightning_arresters" ADD CONSTRAINT "lightning_arresters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lightning_arresters" ADD CONSTRAINT "lightning_arresters_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lightning_arresters" ADD CONSTRAINT "lightning_arresters_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battery_banks" ADD CONSTRAINT "battery_banks_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battery_banks" ADD CONSTRAINT "battery_banks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battery_banks" ADD CONSTRAINT "battery_banks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battery_banks" ADD CONSTRAINT "battery_banks_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitor_banks" ADD CONSTRAINT "capacitor_banks_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitor_banks" ADD CONSTRAINT "capacitor_banks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitor_banks" ADD CONSTRAINT "capacitor_banks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitor_banks" ADD CONSTRAINT "capacitor_banks_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_uploaded_file_id_fkey" FOREIGN KEY ("uploaded_file_id") REFERENCES "uploaded_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
