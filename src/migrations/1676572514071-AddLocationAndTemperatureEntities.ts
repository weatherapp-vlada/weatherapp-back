import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationAndTemperatureEntities1676572514071
  implements MigrationInterface
{
  name = 'AddLocationAndTemperatureEntities1676572514071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "location" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "countryCode" character varying NOT NULL, "latitude" integer NOT NULL, "longitude" integer NOT NULL, CONSTRAINT "idx_uniq_city" UNIQUE ("name", "countryCode"), CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temperature" ("timestamp" TIMESTAMP NOT NULL, "temperatureCelsius" integer NOT NULL, "locationId" integer, CONSTRAINT "UQ_4b805cc28990293e877b53ef343" UNIQUE ("timestamp", "locationId"), CONSTRAINT "PK_34e5d55575f18916ac291f1905a" PRIMARY KEY ("timestamp"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "temperature" ADD CONSTRAINT "FK_290f758ca4eeb7574510a46ecd2" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "temperature" DROP CONSTRAINT "FK_290f758ca4eeb7574510a46ecd2"`,
    );
    await queryRunner.query(`DROP TABLE "temperature"`);
    await queryRunner.query(`DROP TABLE "location"`);
  }
}
