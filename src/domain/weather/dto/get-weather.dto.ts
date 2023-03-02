import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Validate } from 'class-validator';

import { IsLessOrEqualConstraint } from '../../../validators';

export class GetWeatherDto {
  @ApiProperty({
    type: Date,
  }) // TODO: validations
  // @IsDateString({ strict: true })
  // @Validate(MatchesDatePatternConstraint)
  @Validate(IsLessOrEqualConstraint, ['endDate'])
  startDate: Date;

  @ApiProperty({
    type: Date,
  })
  // @IsDateString({ strict: true })
  // @Validate(MatchesDatePatternConstraint)
  endDate: Date;

  @ApiPropertyOptional({
    type: Number,
    isArray: true,
  })
  @Transform(({ value }) => value.split(','))
  locationIds?: number[];
}
