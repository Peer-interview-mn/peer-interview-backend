export const ForgotPassword = (resetToken: string) => {
  return `
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="20" style="border: 1px solid #ccc; border-radius: 8px; margin-top: 50px;">
                    <tr>
                        <td align="center">
                            <h2 style="color: #333;">Password Reset</h2>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style="font-size: 14px; line-height: 22px">We have received a request to update your account password related to our peer-to-peer chat platform. Copy the code below to proceed with password reset: ${resetToken}</p>
                            <p style="font-size: 14px; line-height: 22px">If you did not request a password reset, please ignore this email. Your account security is important to us, and no changes will be made without your confirmation.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;
};
