export interface NodeEntity {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
}
