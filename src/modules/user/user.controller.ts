import * as bcrypt from 'bcrypt';
import {IUser} from './types/user';
import {JwtService} from '@nestjs/jwt';
import {UserService} from './user.service';
import {IResponse} from 'src/types/response';
import {UserGuard} from './guards/user.guard';
import {AuthGuard} from '../auth/guards/auth.guard';
import {ImageService} from '../image/image.service';
import {CommonService} from '../common/common.service';
import {RecipeService} from '../recipe/recipe.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {AuthErrorMessages} from 'src/configs/messages/auth';
import {UserSuccessMessages} from 'src/configs/messages/user';
import {UpdateSavedRecipesDto} from './dto/update-saved-recipes.dto';
import {Controller, Get, Body, Put, Param, Delete, UseGuards, HttpException, HttpStatus, UseInterceptors, UploadedFile} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
    private readonly imageService: ImageService,
    private readonly recipeService: RecipeService,
    private readonly commonService: CommonService
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<IUser>> {
    const response = await this.userService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.findOne,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(UserGuard)
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> {
    const {imageId, _id} = await this.commonService.findOneUserAPI('_id', id);
    await this.recipeService.removeAll('authorId', _id); // delete recipes
    await this.imageService.remove(imageId); // delete image(avatar)
    const response = await this.userService.remove(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('security/:id')
  @UseGuards(AuthGuard)
  @UseGuards(UserGuard)
  async updateSecurity(@Param('id') id: string, @Body() updateSecurityDto: UpdateSecurityDto): Promise<IResponse<undefined>> {
    const {password} = await this.commonService.findOneUserAPI('_id', id);
    const isPassValid = bcrypt.compareSync(updateSecurityDto.oldPassword, password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    const response = await this.userService.updateSecurity(id, updateSecurityDto);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('saved-recipes/:id')
  @UseGuards(AuthGuard)
  @UseGuards(UserGuard)
  async updateSavedRecipes(@Param('id') id: string, @Body() updateSavedRecipesDto: UpdateSavedRecipesDto): Promise<IResponse<undefined>> {
    const {savedRecipes} = await this.commonService.findOneUserAPI('_id', id);
    const savedRecipesSet = new Set(savedRecipes);
    if(savedRecipesSet.has(updateSavedRecipesDto.recipe)) {
      savedRecipesSet.delete(updateSavedRecipesDto.recipe);
    } else {
      savedRecipesSet.add(updateSavedRecipesDto.recipe);
    }
    const response = await this.userService.updateSavedRecipes(id, Array.from(savedRecipesSet));
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('profile/:id')
  @UseGuards(AuthGuard)
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto): Promise<IResponse<undefined>> { 
    let avatarId = undefined;
    const {_id, password, imageId} = await this.commonService.findOneUserAPI('_id', id);
    if(file) {
      if(imageId) {
        await this.imageService.update(imageId, file.buffer, {folder: 'Rivegs/avatars'});
      } else {
        avatarId = await this.imageService.create(file.buffer, {folder: 'Rivegs/avatars'});
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
    const response = await this.userService.updateProfile(id, updateProfileDto, avatarId);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
