// src/database/migrations/1700000000000-InitialInventoryMigration.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialInventoryMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enums
    await queryRunner.query(`CREATE TYPE "parts_status_enum" AS ENUM ('in_stock', 'used', 'defective', 'reserved');`);
    await queryRunner.query(`CREATE TYPE "devices_status_enum" AS ENUM ('active', 'inactive', 'maintenance', 'retired');`);
    await queryRunner.query(`CREATE TYPE "toners_color_enum" AS ENUM ('black', 'cyan', 'magenta', 'yellow');`);
    await queryRunner.query(`CREATE TYPE "inventory_transaction_type_enum" AS ENUM ('claim', 'collect', 'add');`);

    // 2. Create parts
    await queryRunner.query(`CREATE TABLE "parts" (
      "id" SERIAL PRIMARY KEY,
      "name" VARCHAR(128) NOT NULL,
      "description" TEXT,
      "status" "parts_status_enum" NOT NULL DEFAULT 'in_stock',
      "serial_number" VARCHAR(64),
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);

    // 3. Create toners
    await queryRunner.query(`CREATE TABLE "toners" (
      "id" SERIAL PRIMARY KEY,
      "model" VARCHAR(64) NOT NULL,
      "color" "toners_color_enum" NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 0,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);

    // 4. Create devices
    await queryRunner.query(`CREATE TABLE "devices" (
      "id" SERIAL PRIMARY KEY,
      "type" VARCHAR(64) NOT NULL,
      "brand" VARCHAR(64),
      "model" VARCHAR(64),
      "status" "devices_status_enum" NOT NULL DEFAULT 'active',
      "serial_number" VARCHAR(64),
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    );`);

    // 5. Create inventory_transactions with polymorphic "item_type" support
    await queryRunner.query(`CREATE TABLE "inventory_transactions" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "transaction_type" "inventory_transaction_type_enum" NOT NULL,
      "item_type" VARCHAR(32) NOT NULL, -- 'part', 'toner', 'device'
      "item_id" uuid NOT NULL,
      "user_id" uuid NOT NULL,
      "details" JSONB,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "fk_transactions_user" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    );`);

    // 6. Polymorphic integrity via check constraint (one item_type, one ID)
    await queryRunner.query(`
      ALTER TABLE "inventory_transactions" ADD CONSTRAINT "chk_inventory_item_type"
      CHECK ("item_type" IN ('part', 'toner', 'device'))
    `);

    // 7. Indexes for efficient lookups
    await queryRunner.query(`CREATE INDEX "ix_transactions_item" ON "inventory_transactions" ("item_type", "item_id");`);
    await queryRunner.query(`CREATE INDEX "ix_parts_serial" ON "parts" ("serial_number");`);
    await queryRunner.query(`CREATE INDEX "ix_devices_serial" ON "devices" ("serial_number");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_devices_serial";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_parts_serial";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "ix_transactions_item";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_transactions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "devices";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "toners";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "parts";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inventory_transaction_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "toners_color_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "devices_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "parts_status_enum";`);
  }
}
