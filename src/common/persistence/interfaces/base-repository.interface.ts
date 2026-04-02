export interface IBaseRepository<
  TEntity,
  TCreate,
  TFilter = Record<string, unknown>,
> {
  create(payload: TCreate): Promise<TEntity>;
  findById(id: string): Promise<TEntity | null>;
  findAll(filter?: TFilter): Promise<TEntity[]>;
  deleteMany(filter: TFilter): Promise<number>;
}
