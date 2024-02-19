import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {DBs} from 'src/configs/DBs';
import {User} from './schemas/user.schema';
import {InjectModel} from '@nestjs/mongoose';
import {CommonService} from '../common/common.service';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UpdateSecurityDto} from './dto/update-security.dto';
import {UserSuccessMessages} from 'src/configs/messages/user';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AuthErrorMessages, AuthSuccessMessages} from 'src/configs/messages/auth';

@Injectable()
export class UserService {
  constructor(
    private readonly commonService: CommonService,
    @InjectModel(DBs.users) private readonly userModel: Model<User>
  ) {}

  async remove(id: string): Promise<string> { // delete recipes, image(avatar)
    await this.userModel.deleteOne({_id: id});
    return UserSuccessMessages.removeOne;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<string> { // image
    const user = await this.commonService.findOneUser(id);
    if(updateProfileDto.email) {
      await this.commonService.sendConfirmEmail(updateProfileDto.email, {email: updateProfileDto.email, _id: user._id, password: user.password});
    }
    await this.userModel.updateOne({_id: id}, {
      email: updateProfileDto.email,
      login: updateProfileDto.login,
      __v: updateProfileDto.email ? 0 : 1,
      description: updateProfileDto.description,
    });
    if(updateProfileDto.email) return AuthSuccessMessages.sentEmail;
    return UserSuccessMessages.updateProfile;
  }

  async updateSecurity(id: string, updateSecurityDto: UpdateSecurityDto): Promise<string> {
    const user = await this.commonService.findOneUser(id);
    const isPassValid = bcrypt.compareSync(updateSecurityDto.oldPassword, user.password);
    if(!isPassValid) throw new HttpException(AuthErrorMessages.wrongPassword, HttpStatus.BAD_REQUEST);
    const password = await bcrypt.hash(updateSecurityDto.password, 5);
    await this.userModel.updateOne({_id: id}, {password});
    return UserSuccessMessages.updatePassword;
  }
}
