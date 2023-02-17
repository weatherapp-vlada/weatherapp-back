import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Temperature } from './temperature.entity';

@Entity()
@Unique('idx_uniq_city', ['name', 'countryCode'])
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'country_code', length: 2 })
  countryCode: string;

  @Column({ type: 'decimal', precision: 19, scale: 16 })
  latitude: number;

  @Column({ type: 'decimal', precision: 19, scale: 16 })
  longitude: number;

  @OneToMany(() => Temperature, (temperature) => temperature.location)
  temperatures: Temperature[];
}
