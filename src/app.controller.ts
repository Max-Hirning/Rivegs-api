import {ContactUsDto} from 'dto/contact-us.dto';
import {MailerService} from '@nestjs-modules/mailer';
import {AuthGuard} from 'modules/auth/guards/auth.guard';
import {ICustomRequest, IResponse} from 'types/app.types';
import {CommonService} from 'modules/common/common.service';
import {Body, Controller, HttpException, HttpStatus, Post, Request, UseGuards} from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly commonService: CommonService,
  ) {}

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
