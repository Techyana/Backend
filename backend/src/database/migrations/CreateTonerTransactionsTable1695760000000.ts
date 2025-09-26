import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTonerTransactionsTable1695760000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'toner_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['CLAIM', 'REQUEST', 'RETURN', 'COLLECT', 'ADD'],
            enumName: 'toner_transactions_type_enum',
            isNullable: false,
          },
          {
            name: 'quantityDelta',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'details',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'tonerId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'toner_transactions',
      new TableForeignKey({
        columnNames: ['tonerId'],
        referencedTableName: 'toners',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'toner_transactions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('toner_transactions');
    await queryRunner.query(`DROP TYPE IF EXISTS \"toner_transactions_type_enum\"`);
  }
}
