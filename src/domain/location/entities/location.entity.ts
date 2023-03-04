import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'location' })
@Unique({ name: 'idx_uniq_city', properties: ['name', 'countryCode'] })
export class LocationEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ length: 2 })
  countryCode!: string;

  @Property({ columnType: 'numeric', precision: 19, scale: 16 })
  latitude!: string;

  @Property({ columnType: 'numeric', precision: 19, scale: 16 })
  longitude!: string;

  @Property()
  timezoneShift!: number;
}
