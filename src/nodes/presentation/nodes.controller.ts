import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateNodeDto } from '../application/dto/create-node.dto';
import { DeleteNodeDto } from '../application/dto/delete-node.dto';
import { NodeService } from '../application/services/node.service';

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodeService: NodeService) {}

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
