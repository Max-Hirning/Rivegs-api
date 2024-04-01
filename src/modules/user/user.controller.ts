import {UserService} from './user.service';
import {IResponse} from 'src/types/app.types';
import {UpdateUserDto} from './dto/update-user.dto';
import {UserSuccessMessages} from 'src/configs/messages/user';
import {Controller, Get, Body, Param, Delete, Put, HttpStatus} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<IResponse<undefined>> {
    console.log(id);
    return ({
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.removeOne,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<undefined>> {
    console.log(id);
    return ({
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.findOne,
    });
  }

  @Put('security/:id')
  async updateSecurity(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<IResponse<undefined>> {
    console.log(id, updateUserDto);
    return ({
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.updateOne,
    });
  }

  @Put('profile/:id')
  async updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<IResponse<undefined>> {
    console.log(id, updateUserDto);
    return ({
      statusCode: HttpStatus.OK,
      message: UserSuccessMessages.updateOne,
    });
  }
}
