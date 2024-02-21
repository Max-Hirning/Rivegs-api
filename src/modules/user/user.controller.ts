import * as bcrypt from 'bcrypt';
import {IUser} from './types/user';
import {UserService} from './user.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {RecipeService} from '../recipe/recipe.service';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {AuthErrorMessages} from 'src/configs/messages/auth';
import {UpdateSavedRecipesDto} from './dto/update-saved-recipes.dto';
import {Controller, Get, Body, Put, Param, Delete, UseGuards, HttpException, HttpStatus} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService,
    private readonly recipeService: RecipeService,
    private readonly commonService: CommonService
  ) {}

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<string> {
    const user = await this.commonService.findOneUserAPI(id);
    await this.recipeService.removeAll(user._id, 'authorId'); // delete recipes
    // delete recipes images
    await this.imageService.remove(user.imageId); // delete image(avatar)
    return this.userService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IUser> {
    return this.userService.findOne(id);
  }

  @Put('profile/:id')
  @UseGuards(AuthGuard)
  async updateProfile(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto): Promise<string> { // update image
    const {_id, password} = await this.commonService.findOneUserAPI(id);
    if(updateProfileDto.email) {
      await this.commonService.sendConfirmEmail(updateProfileDto.email, {email: updateProfileDto.email, _id: _id, password: password});
    }
    return this.userService.updateProfile(id, updateProfileDto);
  }

  @Put('security/:id')
  @UseGuards(AuthGuard)
  async updateSecurity(@Param('id') id: string, @Body() updateSecurityDto: UpdateSecurityDto): Promise<string> {
    const {password} = await this.commonService.findOneUserAPI(id);
    const isPassValid = bcrypt.compareSync(updateSecurityDto.oldPassword, password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    return this.userService.updateSecurity(id, updateSecurityDto);
  }

  @UseGuards(AuthGuard)
  @Put('saved-recipes/:id')
  async updateSavedRecipes(@Param('id') id: string, @Body() updateSavedRecipesDto: UpdateSavedRecipesDto): Promise<string> {
    const {savedRecipes} = await this.commonService.findOneUserAPI(id);
    const savedRecipesSet = new Set(savedRecipes);
    if(savedRecipesSet.has(updateSavedRecipesDto.recipe)) {
      savedRecipesSet.delete(updateSavedRecipesDto.recipe);
    } else {
      savedRecipesSet.add(updateSavedRecipesDto.recipe);
    }
    return this.userService.updateSavedRecipes(id, Array.from(savedRecipesSet));
  }
}
