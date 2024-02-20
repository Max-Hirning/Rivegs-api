import {JwtService} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {ISignInResponse} from './types/sign-in';
import {MailerService} from '@nestjs-modules/mailer';
import {CommonService} from '../common/common.service';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {AuthErrorMessages, AuthSuccessMessages} from 'src/configs/messages/auth';
import {Controller, Post, Body, Put, HttpException, HttpStatus} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    private readonly commonService: CommonService
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<string> {
    const user = await this.authService.signUp(signUpDto);
    await this.commonService.sendConfirmEmail(user.email, {email: user.email, _id: user._id, password: user.password});
    return AuthSuccessMessages.sentEmail;
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<ISignInResponse> {
    const user = await this.authService.signIn(signInDto);
    return ({
      userId: user._id.toString(),
      token: this.jwtService.sign({_id: user._id, email: user.email, password: user.password}),
    });
  }

  @Post('email-request')
  async emailRequest(@Body() emailRequestDto: EmailRequestDto): Promise<string> {
    const user = await this.authService.emailRequest(emailRequestDto);
    const code = this.jwtService.sign({email: user.email, _id: user._id, password: user.password}, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${emailRequestDto.url}/?code=${code}">Update your security data</a>
        </div>
      `,
      to: user.email,
      subject: 'Update your security data',
    });
    return AuthSuccessMessages.sentEmail;
  }

  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<string> {
    const codeData = await this.jwtService.decode(resetPasswordDto.code);
    if(codeData && codeData.email && codeData._id) {
      const user = await this.commonService.findOneUserAPI(codeData._id);
      if(user.email === codeData.email && codeData.password === user.password) {
        return this.authService.resetPassword(user._id, resetPasswordDto);
      }
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }
}
