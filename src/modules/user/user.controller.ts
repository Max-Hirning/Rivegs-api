import {IUser} from './types/user';
import {UserService} from './user.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {CommonService} from '../common/common.service';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {Controller, Get, Body, Put, Param, Delete, UseGuards} from '@nestjs/common';

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
    const user = await this.commonService.findOneUser(id);
    const userCopy = JSON.parse(JSON.stringify(user));
    delete userCopy.password;
    delete userCopy.__v;
    return userCopy;
  }

  @Put('profile/:id')
  @UseGuards(AuthGuard)
  async updateProfile(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto): Promise<string> {
    return this.userService.updateProfile(id, updateProfileDto);
  }

  @Put('security/:id')
  @UseGuards(AuthGuard)
  async updateSecurity(@Param('id') id: string, @Body() updateSecurityDto: UpdateSecurityDto): Promise<string> {
    return this.userService.updateSecurity(id, updateSecurityDto);
  }
}
