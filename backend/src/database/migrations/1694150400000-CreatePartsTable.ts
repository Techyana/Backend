// src/migrations/1694150400000-CreatePartsTable.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartsTable1694150400000 implements MigrationInterface {
  name = 'CreatePartsTable1694150400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Create status enum
    await queryRunner.query(`
      CREATE TYPE "part_status_enum" AS ENUM('AVAILABLE','USED')
    `);

    // 2) Create parts table
    await queryRunner.query(`
      CREATE TABLE "parts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "part_number" varchar(50) NOT NULL,
        "for_device_models" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "status" "part_status_enum" NOT NULL DEFAULT 'AVAILABLE',
        "claimed_by_user_id" uuid,
        "claimed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_parts_id" PRIMARY KEY ("id")
      )
    `);

    // 3) Add foreign key to users
    await queryRunner.query(`
      ALTER TABLE "parts"
      ADD CONSTRAINT "FK_parts_claimed_by_user"
      FOREIGN KEY ("claimed_by_user_id") REFERENCES "users"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback in reverse order
    await queryRunner.query(`
      ALTER TABLE "parts"
      DROP CONSTRAINT "FK_parts_claimed_by_user"
    `);
    await queryRunner.query(`DROP TABLE "parts"`);
    await queryRunner.query(`DROP TYPE "part_status_enum"`);
  }
}
