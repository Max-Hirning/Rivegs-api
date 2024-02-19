import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {DBs} from './configs/DBs';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {User} from './modules/user/schemas/user.schema';
import {AuthErrorMessages} from './configs/messages/auth';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(DBs.users) private userModel: Model<User>,
  ) {}

  async confirmEmail(code: string): Promise<void> {
    const codeData = await this.jwtService.decode(code);
    if(codeData && codeData.email && codeData._id) {
      const user = await this.userModel.findById(codeData._id);
      const isPassValid = bcrypt.compare(codeData.password, user.password);
      if(user.email === codeData.email && isPassValid) {
        await this.userModel.updateOne({_id: codeData._id}, {__v: 1});
        return;
      }
    }
    throw new HttpException(AuthErrorMessages.wrongCode, HttpStatus.BAD_REQUEST);
  }
}
