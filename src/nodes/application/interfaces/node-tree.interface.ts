import type { NodeEntity } from '../../domain/entities/node.entity';

export interface TreeNode extends NodeEntity {
  children: TreeNode[];
}
