export const AccountVerifyCode = (code: string) => {
  return `
    <div>
        <p style="font-size: 14px; line-height: 22px;">
            Welcome to the Peer to Peer Interview Platform! We're thrilled to have you join our community. To ensure your account's security, please
            enter the following One-Time Passcode (OTP) for verification: <b>${code}</b>
            <br> Let's embark on this journey to mastering interviews together!
        </p>
    </div>`;
};
