import {JwtService} from '@nestjs/jwt';
import {CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus} from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);

      const tokenData = this.jwtService.verify(token, {secret: process.env.SECRET_KEY});
      if(req.params.id !== tokenData._id) throw new HttpException('You can`t change another profile', HttpStatus.FORBIDDEN);
      return true;
    } catch (e) {
      throw new HttpException('You can`t change another profile', HttpStatus.FORBIDDEN);
    }
  }
}