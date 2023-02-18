import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'location' })
@Unique('idx_uniq_city', ['name', 'countryCode'])
export class LocationEntity {
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
}
