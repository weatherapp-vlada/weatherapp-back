import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'weather_condition' })
export class WeatherConditionEntity {
  @PrimaryColumn({
    type: 'int',
  })
  id: number;

  @Column()
  description: string;

  @Column()
  icon: string;
}
