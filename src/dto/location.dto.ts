import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { LocationEntity } from 'src/entities/location.entity';

export class LocationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  static fromEntity({ name, countryCode }: LocationEntity) {
    return {
      name,
      countryCode,
    };
  }
}
