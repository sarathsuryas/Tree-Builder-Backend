import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, Length } from 'class-validator';

export class CreateNodeDto {
  @IsString()
  @Length(1, 120)
  @Transform(({ value }: { value: string }) => value.trim())
  name!: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string | null;
}
