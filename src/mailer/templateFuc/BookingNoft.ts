export const BookingNotification = (
  userName: string,
  date: string,
  time: string,
  link: string,
) => {
  return `
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="20" style="border: 1px solid #ccc; border-radius: 8px; margin-top: 50px;">
              <tr>
                <td>
                  <p style="font-size: 14px; line-height: 22px">
                    Dear <b>${userName}</b> <br><br>
                    I hope this email finds you well. We are excited to confirm your upcoming Peer-to-Peer Hard Skill Interview scheduled for January 19, 2024. We appreciate your interest in showcasing your skills and talents with your peer/friend.
                    <br><br>
                    <b>Interview Details:</b>
                    <ul>
                        <li>Date: ${date}<br></li>
                        <li>Time: ${time}<br></li>
                        <li>Location: ${link}<br></li>
                    </ul>
                    <b>How to Join</b>: To join the interview, please click on the following link: ${link}. Please make sure to be available at the designated location on time.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
};
