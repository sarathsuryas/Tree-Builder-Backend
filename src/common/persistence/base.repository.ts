import { Injectable } from '@nestjs/common';
import { FilterQuery, Model, SortOrder, Types } from 'mongoose';
import { IBaseRepository } from './interfaces/base-repository.interface';

@Injectable()
export abstract class BaseRepository<
  TDocument,
  TEntity,
  TCreate,
> implements IBaseRepository<TEntity, TCreate, FilterQuery<TDocument>> {
  protected constructor(
    protected readonly model: Model<TDocument>,
    private readonly mapper: (document: TDocument) => TEntity,
  ) {}

  async create(payload: TCreate): Promise<TEntity> {
    const createdDocument = await this.model.create(payload);

    return this.mapper(createdDocument);
  }

  async findById(id: string): Promise<TEntity | null> {
    const document = await this.model.findById(this.toObjectId(id)).exec();

    return document ? this.mapper(document) : null;
  }

  async findAll(filter: FilterQuery<TDocument> = {}): Promise<TEntity[]> {
    const documents = await this.model
      .find(filter)
      .sort({ path: 1 as SortOrder })
      .exec();

    return documents.map((document) => this.mapper(document));
  }

  async deleteMany(filter: FilterQuery<TDocument>): Promise<number> {
    console.log(`Deleting documents matching filter:`, filter); // Debug log
    const result = await this.model.deleteMany(filter).exec();

    return result.deletedCount ?? 0;
  }

  protected toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}
