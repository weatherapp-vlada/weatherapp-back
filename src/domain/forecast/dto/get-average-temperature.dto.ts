import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, Validate } from 'class-validator';

import { IsLessOrEqualConstraint } from '../../../validators';

export class GetAverageTemperatureDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  cities?: string[];

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  sort = false;
}
