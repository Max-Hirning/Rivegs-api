import {Test, TestingModule} from '@nestjs/testing';
import {RecipeTypeService} from './recipe-type.service';

describe('RecipeTypeService', () => {
  let service: RecipeTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeTypeService],
    }).compile();

    service = module.get<RecipeTypeService>(RecipeTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
