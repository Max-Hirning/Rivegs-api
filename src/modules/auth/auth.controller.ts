import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {AuthGuard} from './guards/auth.guard';
import {ISignInResponse} from './types/sign-in';
import {MailerService} from '@nestjs-modules/mailer';
import {CommonService} from '../common/common.service';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {ICustomRequest, IResponse} from '../../types/app.types';
import {AuthErrorMessages, AuthSuccessMessages} from '../../configs/messages/auth';
import {Controller, Post, Body, HttpStatus, HttpException, UseGuards, Request} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<IResponse<undefined>> {
    const userByEmail = await this.commonService.findOneUserAPI('email', signUpDto.email, true);
    if(userByEmail) throw new HttpException(AuthErrorMessages.existedUserEmail, HttpStatus.BAD_REQUEST);
    const userByLogin = await this.commonService.findOneUserAPI('login', signUpDto.login, true);
    if(userByLogin) throw new HttpException(AuthErrorMessages.existedUserLogin, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(signUpDto.password, 5);
    const response = await this.authService.signUp({
      password,
      email: signUpDto.email,
      login: signUpDto.login,
    });
    const code = this.jwtService.sign({version: response.version, _id: response._id}, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${process.env.ORIGIN_API_URL}/confirm-email?code=${code}">Confirm your email to proceed using our service</a>
        </div>
      `,
      to: signUpDto.email,
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

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<IResponse<ISignInResponse>> {
    if(this.authService.isAdmin(signInDto)) {
      return ({
        data: {
          userId: process.env.ADMIN_ID,
          token: this.jwtService.sign({_id: process.env.ADMIN_ID, version: 0, role: 'Admin'}),
        },
        statusCode: HttpStatus.OK,
        message: AuthSuccessMessages.signIn,
      });
    }
    const user = await this.commonService.findOneUserAPI('email', signInDto.email);
    const isPassValid = bcrypt.compareSync(signInDto.password, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    if(user.__v === 0) throw new HttpException(AuthErrorMessages.confirmEmail, HttpStatus.BAD_REQUEST);
    return ({
      data: {
        userId: user._id.toString(),
        token: this.jwtService.sign({_id: user._id, version: user.version, role: 'User'}),
      },
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.signIn,
    });
  }

  @Post('email-request')
  async emailRequest(@Body() emailRequestDto: EmailRequestDto): Promise<IResponse<undefined>> {
    if(emailRequestDto.email === process.env.ADMIN_EMAIL) throw new HttpException('No such email', HttpStatus.FORBIDDEN);
    const user = await this.commonService.findOneUserAPI('email', emailRequestDto.email);
    const code = this.jwtService.sign({_id: user._id, version: user.version, role: 'User'}, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${emailRequestDto.url}/?code=${code}">Update your security data</a>
        </div>
      `,
      to: user.email,
      from: process.env.ADMIN_EMAIL,
      sender: process.env.ADMIN_EMAIL,
      replyTo: process.env.ADMIN_EMAIL,
      subject: 'Update your security data',
    });
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.sentEmail,
    });
  }

  @UseGuards(AuthGuard)
  @Post('reset-password')
  async resetPassword(@Request() req: ICustomRequest, @Body() resetPasswordDto: ResetPasswordDto): Promise<IResponse<undefined>> {
    const user = await this.commonService.findOneUserAPI('_id', req._id);
    const password = await bcrypt.hash(resetPasswordDto.password, 5);
    const response = await this.authService.resetPassword(user._id.toString(), {password});
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
