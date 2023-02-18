import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class GetAverageTemperatureQuery {
  @ApiProperty()
  @IsDateString({ strict: true })
  startTimestamp: string;

  @ApiProperty()
  @IsDateString({ strict: true })
  endTimestamp: string;

  @ApiPropertyOptional()
  @IsOptional()
  cities?: string[];

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  sort = false;
}
