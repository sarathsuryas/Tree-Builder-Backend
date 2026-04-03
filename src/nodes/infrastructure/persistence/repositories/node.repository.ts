import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from '../../../../common/persistence/base.repository';
import {
  CreateNodeRepositoryInput,
  INodeRepository,
} from '../../../application/interfaces/node.repository.interface';
import { NodeEntity } from '../../../domain/entities/node.entity';
import { Node, NodeDocument } from '../schemas/node.schema';

@Injectable()
export class NodeRepository
  extends BaseRepository<NodeDocument, NodeEntity, CreateNodeRepositoryInput>
  implements INodeRepository
{
  constructor(
    @InjectModel(Node.name) private readonly nodeModel: Model<NodeDocument>,
  ) {
    super(nodeModel, (document) => NodeRepository.toEntity(document));
  }

  async findAll(filter: FilterQuery<NodeDocument> = {}): Promise<NodeEntity[]> {
    const documents = await this.nodeModel
      .find(filter)
      .sort({ path: 1 })
      .exec();

    return documents.map((document) => NodeRepository.toEntity(document));
  }

  async findByPathPrefix(path: string): Promise<NodeEntity[]> {
    return this.findAll({
      path: {
        $regex: `^${NodeRepository.escapeRegex(path)}`,
      },
    });
  }

  async deleteSubtreeByPath(path: string): Promise<number> {
    return this.deleteMany({
      path: {
        $regex: `^${NodeRepository.escapeRegex(path)}`,
      },
    });
  }

  private static toEntity(document: NodeDocument): NodeEntity {
    return {
      id: document._id.toString(),
      name: document.name,
      parentId: document.parentId ? document.parentId.toString() : null,
      path: document.path,
      depth: document.depth,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  private static escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
