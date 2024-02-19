import {AppService} from './app.service';
import {Controller, Get, HttpStatus, Query, Redirect} from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('confirm-email')
  // @Redirect(`${process.env.ORIGIN_URL}/auth/sign-in`, HttpStatus.SEE_OTHER)
  @Redirect('https://github.com/Max-Hirning', HttpStatus.SEE_OTHER)
  async confirmEmail(@Query('code') code: string): Promise<void> {
    return this.appService.confirmEmail(code);
  }
}
