import { registerAs } from '@nestjs/config';
import * as jsonfile from 'jsonfile';
import { join } from 'path';

const CONFIG_FILE = 'cities.json';

export interface CityData {
  name: string;
  countryCode: string;
  lat: number;
  long: number;
}

export default registerAs('app', () => ({
  cities: jsonfile.readFileSync(
    join(__dirname, CONFIG_FILE),
    'utf8',
  ) as CityData[],
}));
