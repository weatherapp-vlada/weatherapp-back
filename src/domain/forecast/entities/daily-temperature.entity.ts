import { Type } from 'class-transformer';
import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

import { TemperatureEntity } from './temperature.entity';

@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder(TemperatureEntity, 'temp')
      .select([
        'temp.location_id as location_id',
        'ROUND(AVG(temp.temperature_celsius), 2) as average_temp',
        `DATE_TRUNC('day', temp.timestamp) as day`,
      ])
      .groupBy('location_id, day'),
})
export class DailyTemperatureEntity {
  @ViewColumn()
  location_id: number;

  @ViewColumn()
  day: Date;

  @ViewColumn()
  @Type(() => Number)
  average_temp: number;
}
