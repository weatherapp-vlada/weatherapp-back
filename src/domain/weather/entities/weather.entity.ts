import {
  Entity,
  ManyToOne,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { LocationEntity } from '../../location/entities';
import { WeatherConditionEntity } from './weather-condition.entity';

@Entity({ tableName: 'weather' })
export class WeatherEntity {
  [OptionalProps]?: 'rainVolume' | 'snowVolume';

  @PrimaryKey({ length: 6 })
  timestamp!: Date;

  @ManyToOne({ entity: () => LocationEntity, primary: true })
  location!: LocationEntity;

  @Property({ columnType: 'float8' })
  temperatureCelsius!: number;

  @Property()
  pressure!: number;

  @Property()
  humidity!: number;

  @Property({ columnType: 'float8' })
  windSpeed!: number;

  @Property()
  windDirection!: number;

  @Property({ columnType: 'float8', default: 0 })
  rainVolume!: number;

  @Property({ columnType: 'float8', default: 0 })
  snowVolume!: number;

  @Property({ columnType: 'float8' })
  precipitationProbability!: number;

  @ManyToOne({ entity: () => WeatherConditionEntity })
  weatherCondition!: WeatherConditionEntity;

  @Property()
  isNight!: boolean;
}
