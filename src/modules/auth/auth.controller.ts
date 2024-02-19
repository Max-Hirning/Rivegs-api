import {AuthService} from './auth.service';
import {CreateAuthDto} from './dto/create-auth.dto';
import {UpdateAuthDto} from './dto/update-auth.dto';
import {Controller, Get, Post, Body, Put, Param, Delete} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createAuthDto: CreateAuthDto): string {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAll(): string {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.authService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto): string {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.authService.remove(+id);
  }
}
