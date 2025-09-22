import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePartsNotificationsTransactions20250921120000 implements MigrationInterface {
  name = 'UpdatePartsNotificationsTransactions20250921120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Parts: change for_device_models to text[] (from uuid[])
    await queryRunner.query(`
      ALTER TABLE "parts"
      ALTER COLUMN "for_device_models" TYPE text[]
      USING "for_device_models"::text[];
    `);

    // Parts: add claim/collection columns
    await queryRunner.query(`
      ALTER TABLE "parts"
      ADD COLUMN "claimed_by_id" uuid NULL,
      ADD COLUMN "claimed_at" timestamptz NULL,
      ADD COLUMN "collected" boolean NOT NULL DEFAULT false,
      ADD COLUMN "collected_at" timestamptz NULL
    `);

    // Parts: FK to users for claimed_by_id
    await queryRunner.query(`
      ALTER TABLE "parts"
      ADD CONSTRAINT "FK_parts_claimed_by_user"
      FOREIGN KEY ("claimed_by_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Notifications: add metadata + is_read
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD COLUMN "metadata" jsonb NULL,
      ADD COLUMN "is_read" boolean NOT NULL DEFAULT false
    `);

    // Transactions: index on type for faster admin claims view
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_part_transactions_type"
      ON "part_transactions" ("type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Transactions: drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_part_transactions_type"
    `);

    // Notifications: drop added columns
    await queryRunner.query(`
      ALTER TABLE "notifications"
      DROP COLUMN "is_read",
      DROP COLUMN "metadata"
    `);

    // Parts: drop FK then columns
    await queryRunner.query(`
      ALTER TABLE "parts"
      DROP CONSTRAINT "FK_parts_claimed_by_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "parts"
      DROP COLUMN "collected_at",
      DROP COLUMN "collected",
      DROP COLUMN "claimed_at",
      DROP COLUMN "claimed_by_id"
    `);

    // Parts: revert for_device_models to uuid[] (note: will fail if non-UUID strings present)
    await queryRunner.query(`
      ALTER TABLE "parts"
      ALTER COLUMN "for_device_models" TYPE uuid[]
      USING "for_device_models"::uuid[];
    `);
  }
}
