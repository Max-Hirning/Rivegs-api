import {SignInDto} from './sign-in.dto';
import {PickType} from '@nestjs/mapped-types';

export class ResetPasswordDto extends PickType(SignInDto, ['password']) {}