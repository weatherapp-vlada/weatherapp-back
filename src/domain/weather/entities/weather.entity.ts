import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

import { LocationEntity } from '../../location/entities'; // TODO: fix cross entity reference
import { WeatherConditionEntity } from './weather-condition.entity';

@Entity({ name: 'weather' })
export class WeatherEntity {
  @PrimaryColumn()
  timestamp: Date;

  @PrimaryColumn({ name: 'location_id' })
  locationId: number;

  @ManyToOne(() => LocationEntity)
  @JoinColumn({ name: 'location_id', referencedColumnName: 'id' })
  location: LocationEntity;

  @Column({
    type: 'float',
    name: 'temperature_celsius',
  })
  temperatureCelsius: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  pressure: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  humidity: number;

  @Column({
    type: 'float',
    name: 'wind_speed',
    nullable: true,
  })
  windSpeedMetersPerSecond: number;

  @Column({
    type: 'int',
    name: 'wind_direction',
    nullable: true,
  })
  windDirection: number;

  @Column({
    type: 'float',
    name: 'rain_volume',
    default: 0,
  })
  rainVolumePast3HoursMm: number;

  @Column({
    type: 'float',
    name: 'snow_volume',
    default: 0,
  })
  snowVolumePast3HoursMm: number;

  @Column({
    type: 'float',
    name: 'precipitation_probability',
    nullable: true,
  })
  precipitationProbability: number;

  @Column({ name: 'weather_condition_id' })
  weatherConditionId: number;

  @ManyToOne(() => WeatherConditionEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'weather_condition_id', referencedColumnName: 'id' })
  weatherCondition: WeatherConditionEntity;

  @Column({
    name: 'is_night',
  })
  isNight: boolean;
}
