import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'weather_condition' })
export class WeatherConditionEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  description!: string;

  @Property()
  icon!: string;
}
