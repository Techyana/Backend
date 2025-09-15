import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1757869422294 implements MigrationInterface {
    name = 'InitialTables1757869422294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parts" DROP CONSTRAINT "FK_437c86ae71643bb9526253df539"`);
        await queryRunner.query(`CREATE TYPE "public"."part_transactions_type_enum" AS ENUM('claim', 'request', 'return', 'collect')`);
        await queryRunner.query(`CREATE TABLE "part_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."part_transactions_type_enum" NOT NULL, "quantityDelta" integer NOT NULL DEFAULT '1', "details" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "part_id" uuid, "user_id" uuid NOT NULL, CONSTRAINT "PK_b4dac52f4b12eb4b3d7a9073019" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('part_arrival', 'part_available', 'general')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" text NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "metadata" jsonb, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying(100) NOT NULL, "details" text, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stripped_parts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "partName" character varying(150) NOT NULL, "stripped_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deviceId" uuid, "partId" uuid, CONSTRAINT "PK_ee8743d2a3a72c9e489f8a98de7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."devices_status_enum" AS ENUM('approved_for_disposal', 'removed')`);
        await queryRunner.query(`CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model" character varying(100) NOT NULL, "serialNumber" character varying(100) NOT NULL, "status" "public"."devices_status_enum" NOT NULL DEFAULT 'approved_for_disposal', "customerName" character varying, "condition" character varying, "comments" character varying, "removalReason" character varying, "created_at_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_190fa9fd55b3263df273e808cd3" UNIQUE ("serialNumber"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."toners_color_enum" AS ENUM('black', 'cyan', 'magenta', 'yellow')`);
        await queryRunner.query(`CREATE TABLE "toners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model" character varying(100) NOT NULL, "edpCode" character varying(100) NOT NULL, "color" "public"."toners_color_enum" NOT NULL, "yield" integer, "stock" integer NOT NULL DEFAULT '0', "for_device_models" text array NOT NULL DEFAULT ARRAY[]::text[], "created_at_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_937c96253575ae61c57d8232e9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "claimed_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "claimed_at"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "requested_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "requested_by_user_email"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "requested_at_timestamp"`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "available_quantity" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "client" character varying`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "deviceSerial" character varying`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "collected" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "for_device_models" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TYPE "public"."parts_status_enum" RENAME TO "parts_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."parts_status_enum" AS ENUM('available', 'used', 'requested', 'pending_collection', 'collected')`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" TYPE "public"."parts_status_enum" USING "status"::"text"::"public"."parts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" SET DEFAULT 'available'`);
        await queryRunner.query(`DROP TYPE "public"."parts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "part_transactions" ADD CONSTRAINT "FK_c7c32d1b232270125c7de6c28f6" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "part_transactions" ADD CONSTRAINT "FK_41fa65e3a53c4cde4d6e335ed13" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_d54f841fa5478e4734590d44036" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stripped_parts" ADD CONSTRAINT "FK_47a62ead80f81e188f6d6b26078" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stripped_parts" ADD CONSTRAINT "FK_11289e9b61c4a07588b197937fb" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stripped_parts" DROP CONSTRAINT "FK_11289e9b61c4a07588b197937fb"`);
        await queryRunner.query(`ALTER TABLE "stripped_parts" DROP CONSTRAINT "FK_47a62ead80f81e188f6d6b26078"`);
        await queryRunner.query(`ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_d54f841fa5478e4734590d44036"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`ALTER TABLE "part_transactions" DROP CONSTRAINT "FK_41fa65e3a53c4cde4d6e335ed13"`);
        await queryRunner.query(`ALTER TABLE "part_transactions" DROP CONSTRAINT "FK_c7c32d1b232270125c7de6c28f6"`);
        await queryRunner.query(`CREATE TYPE "public"."parts_status_enum_old" AS ENUM('AVAILABLE', 'USED', 'PENDING_COLLECTION', 'REQUESTED')`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" TYPE "public"."parts_status_enum_old" USING "status"::"text"::"public"."parts_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'`);
        await queryRunner.query(`DROP TYPE "public"."parts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."parts_status_enum_old" RENAME TO "parts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "parts" ALTER COLUMN "for_device_models" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "collected"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "deviceSerial"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "client"`);
        await queryRunner.query(`ALTER TABLE "parts" DROP COLUMN "available_quantity"`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "requested_at_timestamp" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "requested_by_user_email" character varying`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "requested_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "claimed_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "parts" ADD "claimed_by_user_id" uuid`);
        await queryRunner.query(`DROP TABLE "toners"`);
        await queryRunner.query(`DROP TYPE "public"."toners_color_enum"`);
        await queryRunner.query(`DROP TABLE "devices"`);
        await queryRunner.query(`DROP TYPE "public"."devices_status_enum"`);
        await queryRunner.query(`DROP TABLE "stripped_parts"`);
        await queryRunner.query(`DROP TABLE "activity_logs"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "part_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."part_transactions_type_enum"`);
        await queryRunner.query(`ALTER TABLE "parts" ADD CONSTRAINT "FK_437c86ae71643bb9526253df539" FOREIGN KEY ("claimed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
