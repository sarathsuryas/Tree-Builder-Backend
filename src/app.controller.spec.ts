import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  it('returns service health information', () => {
    expect(appController.getHealth()).toEqual({
      status: 'ok',
      service: 'recursive-node-tree-builder',
    });
  });
});
