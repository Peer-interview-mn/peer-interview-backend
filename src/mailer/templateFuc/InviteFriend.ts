export const InviteFriend = (url: string) => {
  return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="20" style="border: 1px solid #ccc; border-radius: 8px; margin-top: 50px;">
            <tr>
              <td>
                <p style="font-size: 14px; line-height: 22px">
                  Hello! <br><br>
                  You have been invited to a meeting on the Peer to Peer Interview Platform. Please use the following link to join the meeting:
                  <br><br>
                  <a href="${url}" style="text-decoration: none; color: #007bff;">Join Meeting</a>
                  <br><br>
                  If you have any questions or issues, feel free to contact us. We look forward to seeing you at the meeting!
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};
