import {JwtService} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {IResponse} from 'src/types/response';
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
  async signUp(@Body() signUpDto: SignUpDto): Promise<IResponse<undefined>> {
    const user = await this.authService.signUp(signUpDto);
    await this.commonService.sendConfirmEmail(user.email, {email: user.email, _id: user._id, password: user.password});
    return ({
      statusCode: HttpStatus.CREATED,
      message: AuthSuccessMessages.sentEmail
    });
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<IResponse<ISignInResponse>> {
    const user = await this.authService.signIn(signInDto);
    return ({
      data: {
        userId: user._id.toString(),
        token: this.jwtService.sign({_id: user._id, email: user.email, password: user.password}),
      },
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.signIn
    });
  }

  @Post('email-request')
  async emailRequest(@Body() emailRequestDto: EmailRequestDto): Promise<IResponse<undefined>> {
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
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.sentEmail,
    });
  }

  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<IResponse<undefined>> {
    const codeData = await this.jwtService.decode(resetPasswordDto.code);
    if(codeData && codeData.email && codeData._id) {
      const user = await this.commonService.findOneUserAPI('_id', codeData._id);
      if(user.email === codeData.email && codeData.password === user.password) {
        const response = await this.authService.resetPassword(user._id, resetPasswordDto);
        return ({
          message: response,
          statusCode: HttpStatus.OK,
        });
      }
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }
}
