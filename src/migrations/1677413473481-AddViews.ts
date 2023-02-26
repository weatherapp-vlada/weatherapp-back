import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViews1677413473481 implements MigrationInterface {
  name = 'AddViews1677413473481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE VIEW "daily_temperature_entity" AS SELECT "temp"."location_id" as location_id, ROUND(AVG("temp"."temperature_celsius"), 2) as average_temp, DATE_TRUNC('day', "temp"."timestamp") as day FROM "temperature" "temp" GROUP BY location_id, day`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'daily_temperature_entity',
        'SELECT "temp"."location_id" as location_id, ROUND(AVG("temp"."temperature_celsius"), 2) as average_temp, DATE_TRUNC(\'day\', "temp"."timestamp") as day FROM "temperature" "temp" GROUP BY location_id, day',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'daily_temperature_entity', 'public'],
    );
    await queryRunner.query(`DROP VIEW "daily_temperature_entity"`);
  }
}
