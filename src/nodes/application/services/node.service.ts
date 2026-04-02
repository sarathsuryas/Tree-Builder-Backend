import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { NODE_REPOSITORY } from '../../../common/constants/injection-tokens';
import { CreateNodeDto } from '../dto/create-node.dto';
import { DeleteNodeDto } from '../dto/delete-node.dto';
import type {
  CreateNodeRepositoryInput,
  INodeRepository,
} from '../interfaces/node.repository.interface';
import type { TreeNode } from '../interfaces/node-tree.interface';
import type { NodeEntity } from '../../domain/entities/node.entity';

@Injectable()
export class NodeService {
  constructor(
    @Inject(NODE_REPOSITORY)
    private readonly nodeRepository: INodeRepository,
  ) {}

  async createNode(createNodeDto: CreateNodeDto): Promise<NodeEntity> {
    const parent = createNodeDto.parentId
      ? await this.nodeRepository.findById(createNodeDto.parentId)
      : null;

    if (createNodeDto.parentId && !parent) {
      throw new NotFoundException(
        `Parent node "${createNodeDto.parentId}" was not found.`,
      );
    }

    const nodeId = new Types.ObjectId();
    const payload: CreateNodeRepositoryInput = {
      _id: nodeId,
      name: createNodeDto.name,
      parentId: parent ? new Types.ObjectId(parent.id) : null,
      // Materialized path makes subtree reads/deletes efficient without recursive DB traversal.
      path: `${parent?.path ?? '/'}${nodeId.toString()}/`,
      depth: parent ? parent.depth + 1 : 0,
    };

    return this.nodeRepository.create(payload);
  }

  async getFullTree(): Promise<TreeNode[]> {
    const nodes = await this.nodeRepository.findAll();

    return this.buildTree(nodes);
  }

  async deleteNode(
    deleteNodeDto: DeleteNodeDto,
  ): Promise<{ deletedCount: number }> {
    const targetNode = await this.nodeRepository.findById(deleteNodeDto.id);
    console.log('Target node for deletion:', targetNode); // Debug log to verify node retrieval
    if (!targetNode) {
      throw new NotFoundException(`Node "${deleteNodeDto.id}" was not found.`);
    }

    const deletedCount = await this.nodeRepository.deleteSubtreeByPath(
      targetNode.path,
    );

    return { deletedCount };
  }

  private buildTree(nodes: NodeEntity[]): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    for (const node of nodes) {
      nodeMap.set(node.id, {
        ...node,
        children: [],
      });
    }

    // O(n) tree assembly by resolving each node once and attaching it through a lookup map.
    for (const node of nodeMap.values()) {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);

        if (parent) {
          parent.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    return roots;
  }
}
