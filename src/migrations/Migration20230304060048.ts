import { Migration } from '@mikro-orm/migrations';

export class Migration20230304060048 extends Migration {
  async up(): Promise<void> {
    this
      .addSql(`INSERT INTO "location" (name, country_code, latitude, longitude, timezone_shift) VALUES
    ('Belgrade', 'RS', 44.8178131, 20.4568974, 3600),
    ('Paris', 'FR', 48.8588897, 2.3200410217200766, 3600),
    ('New York', 'US', 40.7127281, -74.0060152, -18000)`);

    this.addSql(
      `INSERT INTO weather_condition (id, description, icon) VALUES ${Object.entries(
        weatherCodes,
      )
        .map(
          ([code, { description, icon }]) =>
            `(${code}, '${description}', '${icon}')`,
        )
        .join(',')}`,
    );
  }
}

const CONDITION_THUNDERSTORM = {
  description: 'Thunderstorm',
  icon: 'wi-thunderstorm',
};
const CONDITION_DRIZZLE = { description: 'Drizzle', icon: 'wi-rain-mix' };
const CONDITION_RAIN = { description: 'Rain', icon: 'wi-rain' };
const CONDITION_SNOW = { description: 'Snow', icon: 'wi-snow' };

const weatherCodes = {
  '200': CONDITION_THUNDERSTORM,
  '201': CONDITION_THUNDERSTORM,
  '202': CONDITION_THUNDERSTORM,
  '210': CONDITION_THUNDERSTORM,
  '211': CONDITION_THUNDERSTORM,
  '212': CONDITION_THUNDERSTORM,
  '221': CONDITION_THUNDERSTORM,
  '230': CONDITION_THUNDERSTORM,
  '231': CONDITION_THUNDERSTORM,
  '232': CONDITION_THUNDERSTORM,
  '300': CONDITION_DRIZZLE,
  '301': CONDITION_DRIZZLE,
  '302': CONDITION_DRIZZLE,
  '310': CONDITION_DRIZZLE,
  '311': CONDITION_DRIZZLE,
  '312': CONDITION_DRIZZLE,
  '313': CONDITION_DRIZZLE,
  '314': CONDITION_DRIZZLE,
  '321': CONDITION_DRIZZLE,
  '500': CONDITION_RAIN,
  '501': CONDITION_RAIN,
  '502': CONDITION_RAIN,
  '503': CONDITION_RAIN,
  '504': CONDITION_RAIN,
  '511': CONDITION_RAIN,
  '520': CONDITION_RAIN,
  '521': CONDITION_RAIN,
  '522': CONDITION_RAIN,
  '531': CONDITION_RAIN,
  '600': CONDITION_SNOW,
  '601': CONDITION_SNOW,
  '602': CONDITION_SNOW,
  '611': CONDITION_SNOW,
  '612': CONDITION_SNOW,
  '613': CONDITION_SNOW,
  '615': CONDITION_SNOW,
  '616': CONDITION_SNOW,
  '620': CONDITION_SNOW,
  '621': CONDITION_SNOW,
  '622': CONDITION_SNOW,
  '701': { description: 'Mist', icon: 'wi-fog' },
  '711': { description: 'Smoke', icon: 'wi-smoke' },
  '721': { description: 'Haze', icon: 'wi-day-haze' },
  '731': { description: 'Dust', icon: 'wi-dust' },
  '741': { description: 'Fog', icon: 'wi-fog' },
  '751': { description: 'Sand', icon: 'wi-sandstorm' },
  '761': { description: 'Dust', icon: 'wi-dust' },
  '762': { description: 'Ash', icon: 'wi-sandstorm' },
  '771': { description: 'Squall', icon: '' },
  '781': { description: 'Tornado', icon: 'wi-tornado' },
  '800': { description: 'Clear', icon: 'wi-day-sunny' },
  '801': { description: 'Few clouds', icon: 'wi-day-cloudy' },
  '802': { description: 'Scattered clouds', icon: 'wi-day-cloudy' },
  '803': { description: 'Broken clouds', icon: 'wi-day-cloudy' },
  '804': { description: 'Overcast clouds', icon: 'wi-cloudy' },
};
