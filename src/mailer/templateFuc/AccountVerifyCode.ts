export const AccountVerifyCode = (code: string) => {
  return `
    <body>
        <div>
         <div style="height:100%; margin:0; padding:0; width:100%">
            <p style="font-size: 14px">Thank you for registering with the Peer to Peer Interview Platform. To safeguard your account's security, we kindly request the following One-Time Passcode (OTP) for verification: ${code}</p>       
        </div>
       </div>
    </body>
    `;
};
