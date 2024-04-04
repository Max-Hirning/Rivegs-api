import {HydratedDocument} from 'mongoose';
import {User} from '../schemas/user.schema';

export interface IUpdateSecurity extends Pick<IUser, 'password'> {}
export interface IUpdateProfile extends Pick<IUser, 'imageId'|'description'|'email'|'savedRecipes'|'login'> {}
export interface IUserResponse extends Pick<IUser, '_id'|'email'|'savedRecipes'|'login'>, Partial<Pick<IUser, 'description'>> {
  avatar: string;
  recipeIds: string[];
}

export type IUser = HydratedDocument<User>;