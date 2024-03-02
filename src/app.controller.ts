import {JwtService} from '@nestjs/jwt';
import {AppService} from './app.service';
import {AuthErrorMessages} from './configs/messages/auth';
import {CommonService} from './modules/common/common.service';
import {Controller, Get, HttpException, HttpStatus, Query, Redirect} from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
    private readonly commonService: CommonService
  ) {}

  @Get('confirm-email')
  // @Redirect(`${process.env.ORIGIN_URL}/auth/sign-in`, HttpStatus.SEE_OTHER)
  @Redirect('https://github.com/Max-Hirning', HttpStatus.SEE_OTHER)
  async confirmEmail(@Query('code') code: string): Promise<void> {
    const codeData = await this.jwtService.decode(code);
    if(codeData && codeData.email && codeData._id) {
      const user = await this.commonService.findOneUserAPI('_id', codeData._id);
      return this.appService.confirmEmail(user, codeData);
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }
}
