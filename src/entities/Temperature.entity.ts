import { Entity, Column, PrimaryColumn, ManyToOne, Unique } from 'typeorm';
import { Location } from './Location.entity';

@Entity()
@Unique(['timestamp', 'location'])
export class Temperature {
  @PrimaryColumn()
  timestamp: Date;

  @Column()
  temperatureCelsius: number;

  @ManyToOne(() => Location, (location) => location.temperatures)
  location: Location;
}
