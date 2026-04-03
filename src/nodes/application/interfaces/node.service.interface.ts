import type { CreateNodeDto } from '../dto/create-node.dto';
import type { DeleteNodeDto } from '../dto/delete-node.dto';
import type { NodeEntity } from '../../domain/entities/node.entity';
import type { TreeNode } from './node-tree.interface';

export interface INodeService {
  createNode(createNodeDto: CreateNodeDto): Promise<NodeEntity>;
  getFullTree(): Promise<TreeNode[]>;
  deleteNode(deleteNodeDto: DeleteNodeDto): Promise<{ deletedCount: number }>;
}
