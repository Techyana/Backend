import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingPartStatusValues1695312345678 implements MigrationInterface {
  name = 'AddMissingPartStatusValues1695312345678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        BEGIN
          ALTER TYPE "parts_status_enum" ADD VALUE 'PENDING_COLLECTION';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END;
        BEGIN
          ALTER TYPE "parts_status_enum" ADD VALUE 'CLAIMED';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END;
        BEGIN
          ALTER TYPE "parts_status_enum" ADD VALUE 'COLLECTED';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END;
        BEGIN
          ALTER TYPE "parts_status_enum" ADD VALUE 'UNAVAILABLE';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END;
      END
      $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op: removing enum values is not supported safely in Postgres
  }
}
