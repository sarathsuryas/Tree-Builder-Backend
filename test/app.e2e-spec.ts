import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

@Controller()
class TestAppController {
  @Get()
  getHealth(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'recursive-node-tree-builder',
    };
  }
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestAppController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/api/v1').expect(200).expect({
      status: 'ok',
      service: 'recursive-node-tree-builder',
    });
  });
});
