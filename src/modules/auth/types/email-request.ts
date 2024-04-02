import {ISignIn} from './sign-in';

export interface IEmailRequest extends Pick<ISignIn, 'email'> {
  url: string;
}