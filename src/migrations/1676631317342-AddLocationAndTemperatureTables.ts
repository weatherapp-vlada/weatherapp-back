import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationAndTemperatureTables1676631317342
  implements MigrationInterface
{
  name = 'AddLocationAndTemperatureTables1676631317342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temperature" ("timestamp" TIMESTAMP NOT NULL, "temperature_celsius" numeric(5,2) NOT NULL, "locationId" integer, CONSTRAINT "UQ_4b805cc28990293e877b53ef343" UNIQUE ("timestamp", "locationId"), CONSTRAINT "PK_34e5d55575f18916ac291f1905a" PRIMARY KEY ("timestamp"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "location" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "country_code" character varying(2) NOT NULL, "latitude" numeric(19,16) NOT NULL, "longitude" numeric(19,16) NOT NULL, CONSTRAINT "idx_uniq_city" UNIQUE ("name", "country_code"), CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "temperature" ADD CONSTRAINT "FK_290f758ca4eeb7574510a46ecd2" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "temperature" DROP CONSTRAINT "FK_290f758ca4eeb7574510a46ecd2"`,
    );
    await queryRunner.query(`DROP TABLE "location"`);
    await queryRunner.query(`DROP TABLE "temperature"`);
  }
}
