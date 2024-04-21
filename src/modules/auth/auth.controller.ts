import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {usersInVerify} from '../../configs';
import {SignUpDto} from './dto/sign-up.dto';
import {IResponse} from '../../types/app.types';
import {ISignInResponse} from './types/sign-in';
import {MailerService} from '@nestjs-modules/mailer';
import {CommonService} from '../common/common.service';
import {ConfirmEmailDto} from './dto/confirm-email.dto';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {Controller, Post, Body, HttpStatus, HttpException} from '@nestjs/common';
import {AuthErrorMessages, AuthSuccessMessages} from '../../configs/messages/auth';

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
    const code = this.commonService.generateUniqueCode();
    usersInVerify[response.email] = {
      code,
      _id: response._id,
    };
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <p>Your code: ${code}</p>
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

  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto): Promise<IResponse<undefined>> {
    const code = usersInVerify[confirmEmailDto.email].code;
    if(code !== confirmEmailDto.code) throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
    await this.authService.confirmEmail(usersInVerify[confirmEmailDto.email]._id.toString());
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.verify,
    });
  }

  @Post('email-request')
  async emailRequest(@Body() emailRequestDto: EmailRequestDto): Promise<IResponse<undefined>> {
    if(emailRequestDto.email === process.env.ADMIN_EMAIL) throw new HttpException('No such user', HttpStatus.BAD_REQUEST);
    const user = await this.commonService.findOneUserAPI('email', emailRequestDto.email);
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
      to: user.email,
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

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<IResponse<undefined>> {
    const user = usersInVerify[resetPasswordDto.email];
    if(user.code !== resetPasswordDto.code) throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(resetPasswordDto.password, 5);
    const response = await this.authService.resetPassword(user._id.toString(), {password});
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
