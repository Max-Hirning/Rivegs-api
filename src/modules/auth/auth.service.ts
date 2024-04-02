import {Model} from 'mongoose';
import {ISignIn} from './types/sign-in';
import {ISignUp} from './types/sign-up';
import {IUser} from '../user/types/user';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../user/schemas/user.schema';
import {Collections} from '../../configs/collections';
import {IResetPassword} from './types/reset-password';
import {AuthSuccessMessages} from '../../configs/messages/auth';

@Injectable()
export class AuthService {
  constructor(@InjectModel(Collections.users) private readonly userModel: Model<User>) {}

  isAdmin({email, password}: ISignIn): boolean {
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) return true;
    return false;
  }

  async signUp(signUp: ISignUp): Promise<IUser> {
    const user = await this.userModel.create(signUp);
    return user;
  }

  async resetPassword(id: string, resetPassword: IResetPassword): Promise<string> {
    await this.userModel.updateOne({_id: id}, {...resetPassword, $inc: {version: 1}});
    return AuthSuccessMessages.resetPassword;
  }
}
