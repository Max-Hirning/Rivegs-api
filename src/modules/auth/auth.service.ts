import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {DBs} from 'src/configs/DBs';
import {JwtService} from '@nestjs/jwt';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {InjectModel} from '@nestjs/mongoose';
import {ISignInResponse} from './types/sign-in';
import {User} from '../user/schemas/user.schema';
import {MailerService} from '@nestjs-modules/mailer';
import {CommonService} from '../common/common.service';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserErrorMessages, UserSuccessMessages} from 'src/configs/messages/user';
import {AuthErrorMessages, AuthSuccessMessages} from 'src/configs/messages/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly commonService: CommonService,
    @InjectModel(DBs.users) private readonly userModel: Model<User>
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<string> {
    const existedUser = await this.userModel.findOne({email: signUpDto.email});
    if(existedUser) throw new HttpException(AuthErrorMessages.emailIsTaken, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(signUpDto.password, 5);
    const user = await this.userModel.create({
      password,
      email: signUpDto.email,
      login: signUpDto.login,
    });
    await this.commonService.sendConfirmEmail(user.email, {email: user.email, _id: user._id, password});
    return AuthSuccessMessages.sentEmail;
  }

  async signIn(signInDto: SignInDto): Promise<ISignInResponse> {
    const user = await this.userModel.findOne(({email: signInDto.email}));
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    const isPassValid = bcrypt.compareSync(signInDto.password, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    if(user.__v !== 1) throw new HttpException(AuthErrorMessages.confirmEmail, HttpStatus.BAD_REQUEST);
    return ({
      userId: user._id.toString(),
      token: this.jwtService.sign({_id: user._id, email: user.email, password: user.password}),
    });
  }

  async emailRequest(emailRequestDto: EmailRequestDto): Promise<string> {
    const user = await this.userModel.findOne({email: emailRequestDto.email});
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.BAD_REQUEST);
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

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const codeData = await this.jwtService.decode(resetPasswordDto.code);
    if(codeData && codeData.email && codeData._id) {
      const user = await this.userModel.findOne({_id: codeData._id});
      if(user.email === codeData.email && codeData.password === user.password) {
        const password = await bcrypt.hash(resetPasswordDto.password, 5);
        await this.userModel.updateOne({_id: codeData._id}, {password});
        return UserSuccessMessages.updatePassword;
      }
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }
}
