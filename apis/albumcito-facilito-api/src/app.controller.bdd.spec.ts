import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const feature = loadFeature('./app.controller.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let appController: AppController;
  let greeting: string;

  test('Requesting the root greeting', ({ given, when, then }) => {
    given('the app controller is ready', async () => {
      const app: TestingModule = await Test.createTestingModule({
        controllers: [AppController],
        providers: [AppService],
      }).compile();

      appController = app.get<AppController>(AppController);
    });

    when('I request the root greeting', () => {
      greeting = appController.getHello();
    });

    then('I receive "Hello World!"', () => {
      expect(greeting).toBe('Hello World!');
    });
  });
});
