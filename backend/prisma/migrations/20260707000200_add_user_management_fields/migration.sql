-- Add user-management profile and first-login fields.

ALTER TABLE "users"
ADD COLUMN "employee_id" VARCHAR(100),
ADD COLUMN "designation" VARCHAR(150),
ADD COLUMN "profile_data" JSONB,
ADD COLUMN "profile_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "require_password_change" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");
CREATE INDEX "idx_users_profile_completed" ON "users"("profile_completed");
CREATE INDEX "idx_users_require_password_change" ON "users"("require_password_change");
