import { Migration } from '@mikro-orm/migrations';

export class Migration20230304055733 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "location" ("id" serial primary key, "name" varchar(255) not null, "country_code" varchar(2) not null, "latitude" numeric not null, "longitude" numeric not null, "timezone_shift" int not null);',
    );
    this.addSql(
      'alter table "location" add constraint "idx_uniq_city" unique ("name", "country_code");',
    );

    this.addSql(
      'create table "weather_condition" ("id" serial primary key, "description" varchar(255) not null, "icon" varchar(255) not null);',
    );

    this.addSql(
      'create table "weather" ("timestamp" timestamptz(6) not null, "location_id" int not null, "temperature_celsius" float8 not null, "pressure" int not null, "humidity" int not null, "wind_speed" float8 not null, "wind_direction" int not null, "rain_volume" float8 not null default 0, "snow_volume" float8 not null default 0, "precipitation_probability" float8 not null, "weather_condition_id" int not null, "is_night" boolean not null, constraint "weather_pkey" primary key ("timestamp", "location_id"));',
    );

    this.addSql(
      'alter table "weather" add constraint "weather_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "weather" add constraint "weather_weather_condition_id_foreign" foreign key ("weather_condition_id") references "weather_condition" ("id") on update cascade;',
    );
  }
}
