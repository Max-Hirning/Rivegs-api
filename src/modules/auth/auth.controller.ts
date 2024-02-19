import {AuthService} from './auth.service';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {ISignInResponse} from './types/sign-in';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {Controller, Post, Body, Put} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<string> {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<ISignInResponse> {
    return this.authService.signIn(signInDto);
  }

  @Post('email-request')
  async emailRequest(@Body() emailRequestDto: EmailRequestDto): Promise<string> {
    return this.authService.emailRequest(emailRequestDto);
  }

  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<string> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
