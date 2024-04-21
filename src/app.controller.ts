import {Response} from 'express';
import {JwtService} from '@nestjs/jwt';
import {AppService} from 'app.service';
import {ContactUsDto} from 'dto/contact-us.dto';
import {MailerService} from '@nestjs-modules/mailer';
import {AuthErrorMessages} from 'configs/messages/auth';
import {AuthGuard} from 'modules/auth/guards/auth.guard';
import {ICustomRequest, IResponse} from 'types/app.types';
import {CommonService} from 'modules/common/common.service';
import {Body, Controller, Get, HttpException, HttpStatus, Post, Query, Request, Res, UseGuards} from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
    private readonly mailerService: MailerService,
    private readonly commonService: CommonService,
  ) {}

  @Get('confirm-email')
  async confirmEmail(@Res() res: Response, @Query('code') code: string): Promise<void> {
    res.redirect(`${process.env.ORIGIN_URL}/auth/sign-in`);
    const codeData = await this.jwtService.decode(code);
    const user = await this.commonService.findOneUserAPI('_id', codeData._id);
    if(user.version === codeData.version) {
      await this.appService.confirmEmail(user._id.toString());
      return;
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }

  @Post('contact-us')
  @UseGuards(AuthGuard)
  async contactUs(@Request() req: ICustomRequest, @Body() contactUsDto: ContactUsDto): Promise<IResponse<undefined>> {
    const user = await this.commonService.findOneUserAPI('_id', contactUsDto.userId);
    if(req._id !== user._id.toString()) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const paragraphs = contactUsDto.text.split('\n');
    let letterContext = '';
    paragraphs.forEach((el: string) => {
      letterContext += `<p>${el}</p> </br>`;
    });
    await this.mailerService.sendMail({
      html: `
        <div>
          <h1>${contactUsDto.title}</h1>
          <h3>User: ${user.login}</h3>
          <h4>User id: ${user._id}</h4>
          <h4>User email: ${user.email}</h4>
          <hr/>
          ${letterContext}
        </div>
      `,
      from: user.email,
      sender: user.email,
      replyTo: user.email,
      subject: 'Rivegs App',
      to: process.env.ADMIN_EMAIL,
    });
    return ({
      statusCode: HttpStatus.CREATED,
      message: 'You have sent email',
    });
  }
}
