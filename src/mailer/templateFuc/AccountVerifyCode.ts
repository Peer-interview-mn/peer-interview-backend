export const AccountVerifyCode = (code: string) => {
  return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
          <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="20" style="border: 1px solid #ccc; border-radius: 8px; margin-top: 50px;">
                  <tr>
                      <td>
                      <p style="font-size: 14px; line-height: 22px">Thank you for registering with the Peer to Peer Interview Platform. To safeguard your account's security, we kindly request the following One-Time Passcode (OTP) for verification: ${code}</p>       
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
  </table>
    `;
};
