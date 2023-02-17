import { Entity, Column, PrimaryColumn, ManyToOne, Unique } from 'typeorm';
import { Location } from './location.entity';

@Entity()
@Unique(['timestamp', 'location'])
export class Temperature {
  @PrimaryColumn()
  timestamp: Date;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'temperature_celsius',
  })
  temperatureCelsius: number;

  @ManyToOne(() => Location, (location) => location.temperatures)
  location: Location;
}
