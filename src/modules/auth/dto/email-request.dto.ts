import {SignInDto} from './sign-in.dto';
import {PickType} from '@nestjs/mapped-types';

export class EmailRequestDto extends PickType(SignInDto, ['email']) {}