import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {UserService} from './user.service';
import {usersInVerify} from '../../configs';
import {IUpdateProfile, IUser} from './types/user';
import {IRecipe} from 'modules/recipe/types/recipe';
import {MailerService} from '@nestjs-modules/mailer';
import {ImageService} from 'modules/image/image.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {AuthGuard} from 'modules/auth/guards/auth.guard';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {CommonService} from 'modules/common/common.service';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {RecipeService} from 'modules/recipe/recipe.service';
import {UserSuccessMessages} from '../../configs/messages/user';
import {ICustomRequest, IResponse} from '../../types/app.types';
import {UpdateSavedRecipesDto} from './dto/update-saved-recipes.dto';
import {AuthErrorMessages, AuthSuccessMessages} from 'configs/messages/auth';
import {Controller, Get, Body, Param, Delete, Put, HttpStatus, HttpException, UploadedFile, UseInterceptors, Request, UseGuards} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly imageService: ImageService,
    private readonly recipeService: RecipeService,
    private readonly commonService: CommonService,
    private readonly mailerService: MailerService,
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
  async remove(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    if(req.role === 'Admin' || req._id === id) {
      const user = await this.commonService.findOneUserAPI('_id', id);
      // delete recipes by author id
      const recipes = await this.commonService.findManyRecipesAPI('authorId', id);
      const {imagesIds, ids} = recipes.reduce((res: {imagesIds: string[], ids: string[]}, {imageId, _id}: IRecipe) => {
        res.imagesIds.push(imageId);
        res.ids.push(_id);
        return res;
      }, {imagesIds: [], ids: []});
      await this.imageService.removeAll(imagesIds); // remove all recipes images
      await this.recipeService.removeMany(ids);
      if(user.imageId) await this.imageService.removeOne(user.imageId); // delete image(avatar)
      const response = await this.userService.removeOne(id);
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Delete('avatar/:id')
  @UseGuards(AuthGuard)
  async removeAvatar(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    if(req._id !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const user = await this.commonService.findOneUserAPI('_id', id);
    if(user.imageId) {
      await this.imageService.removeOne(user.imageId);
      await this.userService.updateProfile(id, {imageId: null});
    }
    return ({
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.updateOne,
    });
  }

  @Put('security/:id')
  @UseGuards(AuthGuard)
  async updateSecurity(@Request() req: ICustomRequest, @Param('id') id: string, @Body() updateSecurityDto: UpdateSecurityDto): Promise<IResponse<undefined>> {
    if(req._id !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const user = await this.commonService.findOneUserAPI('_id', id);
    const isPassValid = bcrypt.compareSync(updateSecurityDto.oldPassword, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(updateSecurityDto.password, 5);
    const response = await this.userService.updateSecurity(id, {password});
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @UseGuards(AuthGuard)
  @Put('saved-recipes/:id')
  async updateSavedRecipes(@Request() req: ICustomRequest, @Param('id') id: string, @Body() updateSavedRecipesDto: UpdateSavedRecipesDto): Promise<IResponse<undefined>> {
    if(req._id !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const user = await this.commonService.findOneUserAPI('_id', id);
    const savedRecipes = new Set(user.savedRecipes);
    if(savedRecipes.has(updateSavedRecipesDto.recipe)) {
      savedRecipes.delete(updateSavedRecipesDto.recipe);
    } else {
      savedRecipes.add(updateSavedRecipesDto.recipe);
    }
    const response = await this.userService.updateProfile(id, {savedRecipes: Array.from(savedRecipes)});
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Put('profile/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(@Request() req: ICustomRequest, @Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateProfileDto: UpdateProfileDto): Promise<IResponse<undefined>> {
    if(req._id !== id) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const updateProfile: Partial<IUpdateProfile> = {};
    const user = await this.commonService.findOneUserAPI('_id', id);
    if(file) {
      if(user.imageId) {
        await this.imageService.updateOne(user.imageId, file.buffer, {
          folder: 'Rivegs/avatars',
          fetch_format: 'png',
          gravity: 'face', 
          crop: 'fill',
          height: 250, 
          width: 250, 
        });
      } else {
        updateProfile.imageId = await this.imageService.createOne(file.buffer, {
          folder: 'Rivegs/avatars',
          fetch_format: 'png',
          gravity: 'face', 
          crop: 'fill',
          height: 250, 
          width: 250, 
        });
      }
    }
    if(updateProfileDto.email) updateProfile.email = updateProfileDto.email;
    if(updateProfileDto.login) updateProfile.login = updateProfileDto.login;
    if(updateProfileDto.description) updateProfile.description = updateProfileDto.description;
    const response = await this.userService.updateProfile(id, updateProfile);
    if(updateProfile.email) {
      const code = this.commonService.generateUniqueCode();
      usersInVerify[user.email] = {
        code,
        _id: user._id,
      };
      await this.mailerService.sendMail({
        html: `
          <div>
            <h3>Please, do not reply to this letter</h3>
            <p>Your code: ${code}</p>
          </div>
        `,
        to: updateProfile.email,
        subject: 'Confirm your email',
        from: process.env.ADMIN_EMAIL,
        sender: process.env.ADMIN_EMAIL,
        replyTo: process.env.ADMIN_EMAIL,
      });
      return ({
        statusCode: HttpStatus.OK,
        message: AuthSuccessMessages.sentEmail,
      });
    }
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
