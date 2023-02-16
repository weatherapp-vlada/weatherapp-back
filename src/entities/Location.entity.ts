import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Temperature } from './Temperature.entity';

@Entity()
@Unique('idx_uniq_city', ['name', 'countryCode'])
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  countryCode: string;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @OneToMany(() => Temperature, (temperature) => temperature.location)
  temperatures: Temperature[];
}
