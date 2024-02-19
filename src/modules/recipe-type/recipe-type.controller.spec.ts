import {Test, TestingModule} from '@nestjs/testing';
import {RecipeTypeService} from './recipe-type.service';
import {RecipeTypeController} from './recipe-type.controller';

describe('RecipeTypeController', () => {
  let controller: RecipeTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeTypeController],
      providers: [RecipeTypeService],
    }).compile();

    controller = module.get<RecipeTypeController>(RecipeTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
