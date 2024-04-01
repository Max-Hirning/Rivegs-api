import {IResponse} from 'src/types/app.types';
import {RecipeService} from './recipe.service';
import {CreateRecipeDto} from './dto/create-recipe.dto';
import {UpdateRecipeDto} from './dto/update-recipe.dto';
import {RecipeSuccessMessages} from 'src/configs/messages/recipe';
import {Controller, Get, Post, Body, Param, Delete, Put, HttpStatus} from '@nestjs/common';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  async findAll(): Promise<IResponse<undefined>> {
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.findMany,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> {
    console.log(id);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.removeOne,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<undefined>> {
    console.log(id);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.findOne,
    });
  }

  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto): Promise<IResponse<undefined>> {
    console.log(createRecipeDto);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.createOne,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto): Promise<IResponse<undefined>> {
    console.log(id, updateRecipeDto);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.updateOne,
    });
  }

  @Put('rate/:id')
  async updateRate(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto): Promise<IResponse<undefined>> {
    console.log(id, updateRecipeDto);
    return ({
      statusCode: HttpStatus.OK,
      message: RecipeSuccessMessages.updateOne,
    });
  }
}
