import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUppercase, Length } from 'class-validator';

export class GetDailyTemperatureDto {
  @ApiProperty({
    type: Date,
  }) // TODO: validations
  // @IsDateString({ strict: true })
  // @Validate(MatchesDatePatternConstraint)
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    type: Date,
  })
  // @IsDateString({ strict: true })
  // @Validate(MatchesDatePatternConstraint)
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsString()
  locationName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2, { message: 'countryCode must be 2 characters.' })
  @IsUppercase()
  countryCode: string;
}
