import {Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto): string {
    console.log(createUserDto);
    return 'This action adds a new user';
  }

  findAll(): string {
    return 'This action returns all user';
  }

  findOne(id: number): string {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto): string {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number): string {
    return `This action removes a #${id} user`;
  }
}
