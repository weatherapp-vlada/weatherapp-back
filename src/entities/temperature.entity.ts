import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { LocationEntity } from './location.entity';

@Entity({ name: 'temperature' })
@Unique(['timestamp', 'location'])
export class TemperatureEntity {
  @PrimaryColumn()
  timestamp: Date;

  @PrimaryColumn({ name: 'location_id' })
  locationId: number;

  @ManyToOne(() => LocationEntity)
  @JoinColumn({ name: 'location_id', referencedColumnName: 'id' })
  location: LocationEntity;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'temperature_celsius',
  })
  temperatureCelsius: number;
}
