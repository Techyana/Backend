import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationTypes1695317890123 implements MigrationInterface {
  name = 'AddNotificationTypes1695317890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        BEGIN
          ALTER TYPE "notifications_type_enum" ADD VALUE 'PART_AVAILABLE';
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN
          ALTER TYPE "notifications_type_enum" ADD VALUE 'PART_REMOVED';
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN
          ALTER TYPE "notifications_type_enum" ADD VALUE 'PART_CLAIMED';
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        BEGIN
          ALTER TYPE "notifications_type_enum" ADD VALUE 'PART_COLLECTED';
        EXCEPTION WHEN duplicate_object THEN NULL; END;
        -- GENERAL likely exists already
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // No safe down for enum value removals
  }
}
