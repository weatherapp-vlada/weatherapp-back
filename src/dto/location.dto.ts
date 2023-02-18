import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LocationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  countryCode: string;
}
