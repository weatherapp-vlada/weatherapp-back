import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationsEntries1676631423321 implements MigrationInterface {
  name = 'AddLocationsEntries1676631423321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "location" (name, country_code, latitude, longitude) VALUES
      ('Belgrade', 'RS', 44.8178131, 20.4568974),
      ('Paris', 'FR', 48.8588897, 2.3200410217200766),
      ('New York', 'US', 40.7127281, -74.0060152)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "location" WHERE name IN ('Belgrade', 'Paris', 'New York')`,
    );
  }
}
