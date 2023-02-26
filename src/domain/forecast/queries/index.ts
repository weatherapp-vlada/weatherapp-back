import { GetAverageTemperatureQueryHandler } from './get-average-temperature.handler';
import { GetDailyTemperatureQueryHandler } from './get-daily-temperature.handler';

export const QueriesHandlers = [
  GetAverageTemperatureQueryHandler,
  GetDailyTemperatureQueryHandler,
];

export * from './get-average-temperature.handler';

export * from './get-daily-temperature.handler';
