import {Model} from 'mongoose';
import {DBs} from 'src/configs/DBs';
import {JwtService} from '@nestjs/jwt';
import {IUser} from '../user/types/user';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../user/schemas/user.schema';
import {MailerService} from '@nestjs-modules/mailer';
import {UserErrorMessages} from 'src/configs/messages/user';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class CommonService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectModel(DBs.users) private readonly userModel: Model<User>
  ) {}

  async findOneUser(id: string): Promise<IUser> {
    const user = await this.userModel.findById(id);
    if(!user) throw new HttpException(UserErrorMessages.findOne, HttpStatus.NOT_FOUND);
    return user;
  }

  async sendConfirmEmail(emailReceiver: string, codePayload: Pick<IUser, 'email'|'_id'|'password'>): Promise<void> {
    const code = this.jwtService.sign(codePayload, {expiresIn: process.env.EMAIL_CODE_EXPIRES_IN});
    await this.mailerService.sendMail({
      html: `
        <div>
          <h3>Please, do not reply to this letter</h3>
          <a href="${process.env.ORIGIN_API_URL}/confirm-email?code=${code}">Confirm your email to proceed using our service</a>
        </div>
      `,
      to: emailReceiver,
      subject: 'Confirm your email',
    });
  }
}
