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
    '200': { description: 'thunderstorm with light rain', icon: '' },
    '201': { description: 'thunderstorm with rain', icon: '' },
    '202': { description: 'thunderstorm with heavy rain', icon: '' },
    '210': { description: 'light thunderstorm', icon: '' },
    '211': { description: 'thunderstorm', icon: '' },
    '212': { description: 'heavy thunderstorm', icon: '' },
    '221': { description: 'ragged thunderstorm', icon: '' },
    '230': { description: 'thunderstorm with light drizzle', icon: '' },
    '231': { description: 'thunderstorm with drizzle', icon: '' },
    '232': { description: 'thunderstorm with heavy drizzle', icon: '' },
    '300': { description: 'light intensity drizzle', icon: '' },
    '301': { description: 'drizzle', icon: '' },
    '302': { description: 'heavy intensity drizzle', icon: '' },
    '310': { description: 'light intensity drizzle rain', icon: '' },
    '311': { description: 'drizzle rain', icon: '' },
    '312': { description: 'heavy intensity drizzle rain', icon: '' },
    '313': { description: 'shower rain and drizzle', icon: '' },
    '314': { description: 'heavy shower rain and drizzle', icon: '' },
    '321': { description: 'shower drizzle', icon: '' },
    '500': { description: 'light rain', icon: '' },
    '501': { description: 'moderate rain', icon: '' },
    '502': { description: 'heavy intensity rain', icon: '' },
    '503': { description: 'very heavy rain', icon: '' },
    '504': { description: 'extreme rain', icon: '' },
    '511': { description: 'freezing rain', icon: '' },
    '520': { description: 'light intensity shower rain', icon: '' },
    '521': { description: 'shower rain', icon: '' },
    '522': { description: 'heavy intensity shower rain', icon: '' },
    '531': { description: 'ragged shower rain', icon: '' },
    '600': { description: 'light snow', icon: '' },
    '601': { description: 'snow', icon: '' },
    '602': { description: 'heavy snow', icon: '' },
    '611': { description: 'sleet', icon: '' },
    '612': { description: 'light shower sleet', icon: '' },
    '613': { description: 'shower sleet', icon: '' },
    '615': { description: 'light rain and snow', icon: '' },
    '616': { description: 'rain and snow', icon: '' },
    '620': { description: 'light shower snow', icon: '' },
    '621': { description: 'shower snow', icon: '' },
    '622': { description: 'heavy shower snow', icon: '' },
    '701': { description: 'mist', icon: '' },
    '711': { description: 'smoke', icon: '' },
    '721': { description: 'haze', icon: '' },
    '731': { description: 'sand/dust whirls', icon: '' },
    '741': { description: 'fog', icon: '' },
    '751': { description: 'sand', icon: '' },
    '761': { description: 'dust', icon: '' },
    '762': { description: 'volcanic ash', icon: '' },
    '771': { description: 'squalls', icon: '' },
    '781': { description: 'tornado', icon: '' },
    '800': { description: 'clear sky', icon: '' },
    '801': { description: 'few clouds: 11-25%', icon: '' },
    '802': { description: 'scattered clouds: 25-50%', icon: '' },
    '803': { description: 'broken clouds: 51-84%', icon: '' },
    '804': { description: 'overcast clouds: 85-100%', icon: '' },
  };
}
