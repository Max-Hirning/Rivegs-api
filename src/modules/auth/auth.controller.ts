import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {IResponse} from 'src/types/app.types';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {AuthSuccessMessages} from 'src/configs/messages/auth';
import {Controller, Post, Body, Patch, HttpStatus} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<IResponse<undefined>> {
    console.log(signInDto);
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.signIn,
    });
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<IResponse<undefined>> {
    console.log(signUpDto);
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.sentEmail,
    });
  }

  @Patch('email-request')
  async emailRequest(@Body() emailRequestDto: EmailRequestDto): Promise<IResponse<undefined>> {
    console.log(emailRequestDto);
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.sentEmail,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<IResponse<undefined>> {
    console.log(resetPasswordDto);
    return ({
      statusCode: HttpStatus.OK,
      message: AuthSuccessMessages.resetPassword,
    });
  }
}
