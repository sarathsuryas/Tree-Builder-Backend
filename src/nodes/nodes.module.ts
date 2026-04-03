import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NODE_REPOSITORY,
  NODE_SERVICE,
} from '../common/constants/injection-tokens';
import { NodeService } from './application/services/node.service';
import { NodeRepository } from './infrastructure/persistence/repositories/node.repository';
import {
  Node,
  NodeSchema,
} from './infrastructure/persistence/schemas/node.schema';
import { NodesController } from './presentation/nodes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Node.name,
        schema: NodeSchema,
      },
    ]),
  ],
  controllers: [NodesController],
  providers: [
    NodeService,
    NodeRepository,
    {
      provide: NODE_REPOSITORY,
      useExisting: NodeRepository,
    },
    {
      provide: NODE_SERVICE,
      useExisting: NodeService,
    },
  ],
  exports: [NODE_REPOSITORY, NODE_SERVICE],
})
export class NodesModule {}
