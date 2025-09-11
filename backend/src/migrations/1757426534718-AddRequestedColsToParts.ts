import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequestedColsToParts1757426534718 implements MigrationInterface {
    name = 'AddRequestedColsToParts1757426534718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "for_device_models" SET DEFAULT ARRAY[]::text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "for_device_models" SET DEFAULT ARRAY[]`);
    }

}
