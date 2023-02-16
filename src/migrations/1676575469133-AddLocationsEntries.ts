import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationsEntries1676575469133 implements MigrationInterface {
  name = 'AddLocationsEntries1676575469133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "location" (name, "countryCode", latitude, longitude) VALUES
      ('Belgrade', 'RS', 44.787197, 20.457273),
      ('Paris', 'FR', 48.864716, 2.349014),
      ('New York', 'US', 40.730610, -73.935242)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "location" WHERE name IN ('Belgrade', 'Paris', 'New York')`,
    );
  }
}
