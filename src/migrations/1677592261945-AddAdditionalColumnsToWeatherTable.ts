import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdditionalColumnsToWeatherTable1677592261945
  implements MigrationInterface
{
  name = 'AddAdditionalColumnsToWeatherTable1677592261945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "weather_condition" ("id" integer NOT NULL, "description" character varying NOT NULL, "icon" character varying NOT NULL, CONSTRAINT "PK_d5b3435df5e5392586b1a8e71e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "weather" ("timestamp" TIMESTAMP NOT NULL, "location_id" integer NOT NULL, "temperature_celsius" double precision NOT NULL, "pressure" integer, "humidity" integer, "wind_speed" double precision, "wind_direction" integer, "rain_volume" double precision NOT NULL DEFAULT '0', "snow_volume" double precision NOT NULL DEFAULT '0', "precipitation_probability" double precision, "weather_condition_id" integer NOT NULL, "is_night" boolean NOT NULL, CONSTRAINT "PK_aebd7cdac36159e5ddd48ece202" PRIMARY KEY ("timestamp", "location_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD "timezone_shift" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "weather" ADD CONSTRAINT "FK_b13fa5831aa3bd06e2c56ccfcc2" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "weather" ADD CONSTRAINT "FK_43a4fa6edb93648f48679217445" FOREIGN KEY ("weather_condition_id") REFERENCES "weather_condition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `INSERT INTO weather_condition (id, description, icon) VALUES ${Object.entries(
        this.weatherCodes,
      )
        .map(
          ([code, { description, icon }]) =>
            `(${code}, '${description}', '${icon}')`,
        )
        .join(',')}`,
    );

    await queryRunner.query(
      `INSERT INTO weather ("timestamp", location_id, temperature_celsius)
          SELECT * FROM temperature`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "weather" DROP CONSTRAINT "FK_43a4fa6edb93648f48679217445"`,
    );
    await queryRunner.query(
      `ALTER TABLE "weather" DROP CONSTRAINT "FK_b13fa5831aa3bd06e2c56ccfcc2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP COLUMN "timezone_shift"`,
    );
    await queryRunner.query(`DROP TABLE "weather"`);
    await queryRunner.query(`DROP TABLE "weather_condition"`);
  }

  weatherCodes = {
    '200': { description: 'Thunderstorm', icon: '' },
    '201': { description: 'Thunderstorm', icon: '' },
    '202': { description: 'Thunderstorm', icon: '' },
    '210': { description: 'Thunderstorm', icon: '' },
    '211': { description: 'Thunderstorm', icon: '' },
    '212': { description: 'Thunderstorm', icon: '' },
    '221': { description: 'Thunderstorm', icon: '' },
    '230': { description: 'Thunderstorm', icon: '' },
    '231': { description: 'Thunderstorm', icon: '' },
    '232': { description: 'Thunderstorm', icon: '' },
    '300': { description: 'Drizzle', icon: '' },
    '301': { description: 'Drizzle', icon: '' },
    '302': { description: 'Drizzle', icon: '' },
    '310': { description: 'Drizzle', icon: '' },
    '311': { description: 'Drizzle', icon: '' },
    '312': { description: 'Drizzle', icon: '' },
    '313': { description: 'Drizzle', icon: '' },
    '314': { description: 'Drizzle', icon: '' },
    '321': { description: 'Drizzle', icon: '' },
    '500': { description: 'Rain', icon: '' },
    '501': { description: 'Rain', icon: '' },
    '502': { description: 'Rain', icon: '' },
    '503': { description: 'Rain', icon: '' },
    '504': { description: 'Rain', icon: '' },
    '511': { description: 'Rain', icon: '' },
    '520': { description: 'Rain', icon: '' },
    '521': { description: 'Rain', icon: '' },
    '522': { description: 'Rain', icon: '' },
    '531': { description: 'Rain', icon: '' },
    '600': { description: 'Snow', icon: '' },
    '601': { description: 'Snow', icon: '' },
    '602': { description: 'Snow', icon: '' },
    '611': { description: 'Snow', icon: '' },
    '612': { description: 'Snow', icon: '' },
    '613': { description: 'Snow', icon: '' },
    '615': { description: 'Snow', icon: '' },
    '616': { description: 'Snow', icon: '' },
    '620': { description: 'Snow', icon: '' },
    '621': { description: 'Snow', icon: '' },
    '622': { description: 'Snow', icon: '' },
    '701': { description: 'Mist', icon: '' },
    '711': { description: 'Smoke', icon: '' },
    '721': { description: 'Haze', icon: '' },
    '731': { description: 'Dust', icon: '' },
    '741': { description: 'Fog', icon: '' },
    '751': { description: 'Sand', icon: '' },
    '761': { description: 'Dust', icon: '' },
    '762': { description: 'Ash', icon: '' },
    '771': { description: 'Squall', icon: '' },
    '781': { description: 'Tornado', icon: '' },
    '800': { description: 'Clear', icon: '' },
    '801': { description: 'Few clouds', icon: '' },
    '802': { description: 'Scattered clouds', icon: '' },
    '803': { description: 'Broken clouds', icon: '' },
    '804': { description: 'Overcast clouds', icon: '' },
  };
}
