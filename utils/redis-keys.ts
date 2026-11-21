const SIGNUP_OTP_KEY = (email: string) => `signup:${email}`;

const FORGOT_PASSWORD_OTP_KEY = (email: string) =>
  `forgot-password:otp:${email}`;

const PASSWORD_RESET_TOKEN_KEY = (tokenHash: string) =>
  `password-reset:token:${tokenHash}`;

export { SIGNUP_OTP_KEY, FORGOT_PASSWORD_OTP_KEY, PASSWORD_RESET_TOKEN_KEY };
