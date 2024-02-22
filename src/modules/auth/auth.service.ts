import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {DBs} from 'src/configs/DBs';
import {IUser} from '../user/types/user';
import {SignInDto} from './dto/sign-in.dto';
import {SignUpDto} from './dto/sign-up.dto';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../user/schemas/user.schema';
import {EmailRequestDto} from './dto/email-request.dto';
import {ResetPasswordDto} from './dto/reset-password.dto';
import {AuthErrorMessages} from 'src/configs/messages/auth';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserErrorMessages, UserSuccessMessages} from 'src/configs/messages/user';

@Injectable()
export class AuthService {
  constructor(@InjectModel(DBs.users) private readonly userModel: Model<User>) {}

  async signUp(signUpDto: SignUpDto): Promise<IUser> {
    const existedUser = await this.userModel.findOne({
      $or: [
        {email: signUpDto.email},
        {login: signUpDto.login}
      ]
    });
    if(existedUser) throw new HttpException(AuthErrorMessages.credentialsIsTaken, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(signUpDto.password, 5);
    const user = await this.userModel.create({
      password,
      email: signUpDto.email,
      login: signUpDto.login,
    });
    return user;
  }

  async signIn(signInDto: SignInDto): Promise<IUser> {
    const user = await this.userModel.findOne(({email: signInDto.email}));
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    const isPassValid = bcrypt.compareSync(signInDto.password, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    if(user.__v !== 1) throw new HttpException(AuthErrorMessages.confirmEmail, HttpStatus.BAD_REQUEST);
    return user;
  }

  async emailRequest(emailRequestDto: EmailRequestDto): Promise<IUser> {
    const user = await this.userModel.findOne({email: emailRequestDto.email});
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.BAD_REQUEST);
    return user;
  }

  async resetPassword(id: string, resetPasswordDto: ResetPasswordDto): Promise<string> {
    const password = await bcrypt.hash(resetPasswordDto.password, 5);
    await this.userModel.updateOne({_id: id}, {password});
    return UserSuccessMessages.updateOne;
  }
}
