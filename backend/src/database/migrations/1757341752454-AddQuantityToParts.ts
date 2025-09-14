import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuantityToParts1757341752454 implements MigrationInterface {
    name = 'AddQuantityToParts1757341752454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parts" DROP CONSTRAINT "FK_parts_claimed_by_user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_email"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "quantity" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "created_at_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "updated_at_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "for_device_models" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TYPE "public"."part_status_enum" RENAME TO "part_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."parts_status_enum" AS ENUM('AVAILABLE', 'USED')`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" TYPE "public"."parts_status_enum" USING "status"::"text"::"public"."parts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'`);
        await queryRunner.query(`DROP TYPE "public"."part_status_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "parts" ADD CONSTRAINT "FK_437c86ae71643bb9526253df539" FOREIGN KEY ("claimed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parts" DROP CONSTRAINT "FK_437c86ae71643bb9526253df539"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`CREATE TYPE "public"."part_status_enum_old" AS ENUM('AVAILABLE', 'USED')`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" TYPE "public"."part_status_enum_old" USING "status"::"text"::"public"."part_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'`);
        await queryRunner.query(`DROP TYPE "public"."parts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."part_status_enum_old" RENAME TO "part_status_enum"`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "for_device_models" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "updated_at_timestamp"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "created_at_timestamp"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "parts" ADD CONSTRAINT "FK_parts_claimed_by_user" FOREIGN KEY ("claimed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
