// src/migrations/1757434917727-AddRequestedFieldsToParts.ts

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequestedFieldsToParts1757434917727 implements MigrationInterface {
    name = 'AddRequestedFieldsToParts1757434917727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add nullable columns for engineer "request part" workflow
        await queryRunner.query(`
            ALTER TABLE "parts"
              ADD COLUMN "requested_by_user_id" uuid,
              ADD COLUMN "requested_by_user_email" character varying,
              ADD COLUMN "requested_at_timestamp" TIMESTAMP WITH TIME ZONE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Roll back: drop the three request‐tracking columns
        await queryRunner.query(`
            ALTER TABLE "parts"
              DROP COLUMN "requested_at_timestamp",
              DROP COLUMN "requested_by_user_email",
              DROP COLUMN "requested_by_user_id"
        `);
    }
}
