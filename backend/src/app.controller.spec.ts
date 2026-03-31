import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  it('should return API info', () => {
    const result = appController.getInfo();
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('version');
    expect(result.status).toBe('running');
  });
});
