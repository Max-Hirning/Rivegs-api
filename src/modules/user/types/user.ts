import {HydratedDocument} from 'mongoose';
import {User} from '../schemas/user.schema';

export type IUser = HydratedDocument<User>;