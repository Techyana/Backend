import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTonerClaimCollectFields1695657600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("toners", [
      new TableColumn({ name: "from", type: "varchar", isNullable: false }),
      new TableColumn({ name: "claimedBy", type: "varchar", isNullable: true }),
      new TableColumn({ name: "claimedAt", type: "timestamp", isNullable: true }),
      new TableColumn({ name: "clientName", type: "varchar", isNullable: true }),
      new TableColumn({ name: "serialNumber", type: "varchar", isNullable: true }),
      new TableColumn({ name: "collectedBy", type: "varchar", isNullable: true }),
      new TableColumn({ name: "collectedAt", type: "timestamp", isNullable: true }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("toners", "from");
    await queryRunner.dropColumn("toners", "claimedBy");
    await queryRunner.dropColumn("toners", "claimedAt");
    await queryRunner.dropColumn("toners", "clientName");
    await queryRunner.dropColumn("toners", "serialNumber");
    await queryRunner.dropColumn("toners", "collectedBy");
    await queryRunner.dropColumn("toners", "collectedAt");
  }
}
