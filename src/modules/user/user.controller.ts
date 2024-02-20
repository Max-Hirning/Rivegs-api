import * as bcrypt from 'bcrypt';
import {IUser} from './types/user';
import {UserService} from './user.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {CommonService} from '../common/common.service';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {AuthErrorMessages} from 'src/configs/messages/auth';
import {Controller, Get, Body, Put, Param, Delete, UseGuards, HttpException, HttpStatus} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly commonService: CommonService
  ) {}

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<string> {
    return this.userService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IUser> {
    const user = await this.userService.findOne(id);
    return user;
  }

  @Put('profile/:id')
  @UseGuards(AuthGuard)
  async updateProfile(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto): Promise<string> {
    const user = await this.commonService.findOneUserAPI(id);
    if(updateProfileDto.email) {
      await this.commonService.sendConfirmEmail(updateProfileDto.email, {email: updateProfileDto.email, _id: user._id, password: user.password});
    }
    return this.userService.updateProfile(id, updateProfileDto);
  }

  @Put('security/:id')
  @UseGuards(AuthGuard)
  async updateSecurity(@Param('id') id: string, @Body() updateSecurityDto: UpdateSecurityDto): Promise<string> {
    const user = await this.commonService.findOneUserAPI(id);
    const isPassValid = bcrypt.compareSync(updateSecurityDto.oldPassword, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    return this.userService.updateSecurity(id, updateSecurityDto);
  }
}
