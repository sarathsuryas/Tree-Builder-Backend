import type { FilterQuery, Types } from 'mongoose';
import type { IBaseRepository } from '../../../common/persistence/interfaces/base-repository.interface';
import type { NodeEntity } from '../../domain/entities/node.entity';
import type { NodeDocument } from '../../infrastructure/persistence/schemas/node.schema';

export interface CreateNodeRepositoryInput {
  _id: Types.ObjectId;
  name: string;
  parentId: Types.ObjectId | null;
  path: string;
  depth: number;
}

export interface INodeRepository extends IBaseRepository<
  NodeEntity,
  CreateNodeRepositoryInput,
  FilterQuery<NodeDocument>
> {
  findByPathPrefix(path: string): Promise<NodeEntity[]>;
  deleteSubtreeByPath(path: string): Promise<number>;
}
