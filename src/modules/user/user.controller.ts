import * as bcrypt from 'bcrypt';
import {IUser} from './types/user';
import {UserService} from './user.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {RecipeService} from '../recipe/recipe.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {AuthErrorMessages} from 'src/configs/messages/auth';
import {UpdateSavedRecipesDto} from './dto/update-saved-recipes.dto';
import {Controller, Get, Body, Put, Param, Delete, UseGuards, HttpException, HttpStatus, UseInterceptors, UploadedFile} from '@nestjs/common';

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
    const user = await this.commonService.findOneUserAPI('_id', id);
    await this.recipeService.removeAll({authorId: user._id}); // delete recipes
    await this.imageService.remove(user.imageId); // delete image(avatar)
    return this.userService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IUser> {
    return this.userService.findOne(id);
  }

  @Put('profile/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto): Promise<string> { // update image
    let avatarId = undefined;
    const {_id, password, imageId} = await this.commonService.findOneUserAPI('_id', id);
    if(file) {
      if(imageId) {
        await this.imageService.update(imageId, file.buffer.toString(), {folder: 'Rivegs/avatars'});
      } else {
        avatarId = await this.imageService.create(file.buffer.toString(), {folder: 'Rivegs/avatars'});
      }
    }
    if(updateProfileDto.email) {
      const user = await this.commonService.findOneUserAPI('email', updateProfileDto.email);
      if(user) throw new HttpException(AuthErrorMessages.emailIsTaken, HttpStatus.BAD_REQUEST);
      await this.commonService.sendConfirmEmail(updateProfileDto.email, {email: updateProfileDto.email, _id: _id, password: password});
    }
    if(updateProfileDto.login) {
      const user = await this.commonService.findOneUserAPI('login', updateProfileDto.login);
      if(user) throw new HttpException(AuthErrorMessages.loginIsTaken, HttpStatus.BAD_REQUEST);
      await this.commonService.sendConfirmEmail(updateProfileDto.email, {email: updateProfileDto.email, _id: _id, password: password});
    }
    return this.userService.updateProfile(id, updateProfileDto, avatarId);
  }

  @Put('security/:id')
  @UseGuards(AuthGuard)
  async updateSecurity(@Param('id') id: string, @Body() updateSecurityDto: UpdateSecurityDto): Promise<string> {
    const {password} = await this.commonService.findOneUserAPI('_id', id);
    const isPassValid = bcrypt.compareSync(updateSecurityDto.oldPassword, password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    return this.userService.updateSecurity(id, updateSecurityDto);
  }

  @UseGuards(AuthGuard)
  @Put('saved-recipes/:id')
  async updateSavedRecipes(@Param('id') id: string, @Body() updateSavedRecipesDto: UpdateSavedRecipesDto): Promise<string> {
    const {savedRecipes} = await this.commonService.findOneUserAPI('_id', id);
    const savedRecipesSet = new Set(savedRecipes);
    if(savedRecipesSet.has(updateSavedRecipesDto.recipe)) {
      savedRecipesSet.delete(updateSavedRecipesDto.recipe);
    } else {
      savedRecipesSet.add(updateSavedRecipesDto.recipe);
    }
    return this.userService.updateSavedRecipes(id, Array.from(savedRecipesSet));
  }
}
