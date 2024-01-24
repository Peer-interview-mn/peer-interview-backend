import { User } from '@/users/entities/user.entity';

export const generateVerifyCode = () => {
  const digits = '0123456789';
  let AVC = '';
  const expireDate = new Date(Date.now() + 15 * 60 * 1000);

  for (let i = 0; i < 6; i++) {
    AVC += digits[Math.floor(Math.random() * 10)];
  }

  return { code: AVC, expireDate };
};

export const verifyCodeCheck = (user: User, clientCode: string): boolean => {
  const { avc_expire, account_verify_code } = user;
  if (!account_verify_code || !avc_expire) return false;

  const nowDate = new Date();
  const checkPass = clientCode === user.account_verify_code;

  if (!checkPass || nowDate > avc_expire) return false;
  return true;
};
