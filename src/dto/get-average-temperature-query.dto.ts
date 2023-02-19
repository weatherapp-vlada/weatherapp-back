import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, Validate } from 'class-validator';
import { MatchesDatePatternConstraint } from 'src/utils/matches-date-pattern.validator';
import { IsLessOrEqualConstraint } from 'src/utils/is-less-or-equal.validator';

export class GetAverageTemperatureQuery {
  @ApiProperty()
  @IsDateString({ strict: true })
  @Validate(MatchesDatePatternConstraint)
  @Validate(IsLessOrEqualConstraint, ['endDate'])
  startDate: string;

  @ApiProperty()
  @IsDateString({ strict: true })
  @Validate(MatchesDatePatternConstraint)
  endDate: string;

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
