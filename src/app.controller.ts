import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'recursive-node-tree-builder',
    };
  }
}
