import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsString,
  IsUppercase,
  Length,
  Validate,
} from 'class-validator';

import { MatchesDatePatternConstraint } from '../validators';

export class GetDailyTemperatureQuery {
  @ApiProperty()
  @IsDateString({ strict: true })
  @Validate(MatchesDatePatternConstraint)
  startDate: string;

  @ApiProperty()
  @IsDateString({ strict: true })
  @Validate(MatchesDatePatternConstraint)
  endDate: string;

  @ApiProperty()
  @IsString()
  locationName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2, { message: 'countryCode must be 2 characters.' })
  @IsUppercase()
  countryCode: string;
}
