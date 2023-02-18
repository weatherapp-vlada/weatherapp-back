import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, Matches } from 'class-validator';

export class GetAverageTemperatureQuery {
  @ApiProperty()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}\-\d{2}\-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-dd format.',
  })
  startDate: string;

  @ApiProperty()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}\-\d{2}\-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-dd format.',
  })
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  cities?: string[];

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  sort = false;
}
