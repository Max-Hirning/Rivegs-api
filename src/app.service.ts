import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {DBs} from './configs/DBs';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {IUser} from './modules/user/types/user';
import {User} from './modules/user/schemas/user.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(DBs.users) private userModel: Model<User>) {}

  async confirmEmail(user: IUser, codeData: Pick<IUser, 'email'|'_id'|'password'>): Promise<void> {
    const isPassValid = bcrypt.compare(codeData.password, user.password);
    if(user.email === codeData.email && isPassValid) {
      await this.userModel.updateOne({_id: codeData._id}, {__v: 1});
      return;
    }
  }
}
