import {ISignIn} from './sign-in';

export interface IResetPassword extends Pick<ISignIn, 'password'> {}