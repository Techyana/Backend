import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClaimFieldsToTonerTransaction1695830400000 implements MigrationInterface {
  name = 'AddClaimFieldsToTonerTransaction1695830400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "toner_transactions" ADD "clientName" character varying`);
    await queryRunner.query(`ALTER TABLE "toner_transactions" ADD "serialNumber" character varying`);
    await queryRunner.query(`ALTER TABLE "toner_transactions" ADD "monoTotal" integer`);
    await queryRunner.query(`ALTER TABLE "toner_transactions" ADD "colorTotal" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "toner_transactions" DROP COLUMN "colorTotal"`);
    await queryRunner.query(`ALTER TABLE "toner_transactions" DROP COLUMN "monoTotal"`);
    await queryRunner.query(`ALTER TABLE "toner_transactions" DROP COLUMN "serialNumber"`);
    await queryRunner.query(`ALTER TABLE "toner_transactions" DROP COLUMN "clientName"`);
  }
}
