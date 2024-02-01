export const generateVerifyCode = () => {
  const digits = '0123456789';
  let AVC = '';
  const expireDate = new Date(Date.now() + 15 * 60 * 1000);

  for (let i = 0; i < 6; i++) {
    AVC += digits[Math.floor(Math.random() * 10)];
  }

  return { code: AVC, expireDate };
};

export const generatePasswordChangeCode = () => {
  const code = generateVerifyCode();
  const expireDate = new Date(Date.now() + 10 * 60 * 1000);
  return { code: code.code, expireDate };
};
