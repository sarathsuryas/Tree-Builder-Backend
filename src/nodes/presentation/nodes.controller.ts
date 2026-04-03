import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { NODE_SERVICE } from '../../common/constants/injection-tokens';
import { CreateNodeDto } from '../application/dto/create-node.dto';
import { DeleteNodeDto } from '../application/dto/delete-node.dto';
import type { INodeService } from '../application/interfaces/node.service.interface';

@Controller('nodes')
export class NodesController {
  constructor(
    @Inject(NODE_SERVICE)
    private readonly nodeService: INodeService,
  ) {}

  @Post()
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodeService.createNode(createNodeDto);
  }

  @Get('')
  getFullTree() {
    return this.nodeService.getFullTree();
  }

  @Delete(':id')
  delete(@Param() deleteNodeDto: DeleteNodeDto) {
    return this.nodeService.deleteNode(deleteNodeDto);
  }
}
