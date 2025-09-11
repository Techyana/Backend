// src/migrations/1694153000000-SeedRicohUnits.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRicohUnits1694153000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "parts"
        (id, name, part_number, for_device_models, status, created_at, updated_at)
      VALUES
        (
          uuid_generate_v4(),
          'Fusing Unit Assembly',
          'B2474970',
          ARRAY['MP 6002','MP 7502'],
          'AVAILABLE',
          now(),
          now()
        ),
        (
          uuid_generate_v4(),
          'PCDU Photoconductor & Developer Unit',
          'M9550127',
          ARRAY['Aficio MP C4502','Aficio MP C5502'],
          'AVAILABLE',
          now(),
          now()
        ),
        (
          uuid_generate_v4(),
          'Main Control PCB Assembly',
          'D2845609',
          ARRAY['Aficio MP 5055SP'],
          'AVAILABLE',
          now(),
          now()
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "parts"
      WHERE part_number IN ('B2474970','M9550127','D2845609');
    `);
  }
}
