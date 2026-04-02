import { IsMongoId } from 'class-validator';

export class DeleteNodeDto {
  @IsMongoId()
  id!: string;
}
