export const AccountVerifyCode = (code: string) => {
  return `
    <div>
        <p style="font-size: 14px; line-height: 22px;">
            Thank you for registering with the Peer to Peer Interview Platform.
            To safeguard your account's security, we kindly request the following One-Time Passcode (OTP) for verification: <b>${code}</b>
        </p>
    </div>`;
};
