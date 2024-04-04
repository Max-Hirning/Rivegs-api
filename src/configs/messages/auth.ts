export enum AuthErrorMessages {
  wrongCode = 'Wrong code',
  wrongPassword = 'Wrong password',
  confirmEmail = 'Confirm your email',
  existedUserEmail = 'User with such email allready exists',
  existedUserLogin = 'User with such login allready exists',
}

export enum AuthSuccessMessages {
  signIn = 'You have been signed in',
  sentEmail = 'We have sent you email',
  resetPassword = 'Password was changed',
}