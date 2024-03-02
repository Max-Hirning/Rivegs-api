import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {DBs} from 'src/configs/DBs';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {User} from 'src/modules/user/schemas/user.schema';
import {CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(DBs.users) private readonly userModel: Model<User>, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      const tokenData = this.jwtService.verify(token, {secret: process.env.SECRET_KEY});
      if(tokenData._id === process.env.ADMIN_ID && tokenData.email === process.env.ADMIN_EMAIL) {
        const isPassValid = bcrypt.compareSync(process.env.ADMIN_PASSWORD, tokenData.password);
        if(isPassValid) return true;
      }
      const user = await this.userModel.findById(tokenData._id);
      if(user.email === tokenData.email && tokenData.password === user.password) {
        req.user = tokenData;
        return true;
      }
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    } catch (e) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}