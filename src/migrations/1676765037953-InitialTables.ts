import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTables1676765037953 implements MigrationInterface {
  name = 'InitialTables1676765037953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "location" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "country_code" character varying(2) NOT NULL, "latitude" numeric(19,16) NOT NULL, "longitude" numeric(19,16) NOT NULL, CONSTRAINT "idx_uniq_city" UNIQUE ("name", "country_code"), CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temperature" ("timestamp" TIMESTAMP NOT NULL, "location_id" integer NOT NULL, "temperature_celsius" numeric(5,2) NOT NULL, CONSTRAINT "PK_c21c4bb738c164c7b3016276d28" PRIMARY KEY ("timestamp", "location_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "temperature" ADD CONSTRAINT "FK_57d59506f86d942d37562d6e65a" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "temperature" DROP CONSTRAINT "FK_57d59506f86d942d37562d6e65a"`,
    );
    await queryRunner.query(`DROP TABLE "temperature"`);
    await queryRunner.query(`DROP TABLE "location"`);
  }
}
