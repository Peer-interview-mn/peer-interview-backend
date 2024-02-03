export const Meeting = (date: string, time: string, link: string) => {
  return `
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="20" style="border: 1px solid #ccc; border-radius: 8px; margin-top: 50px;">
              <tr>
                <td>
                  <p style="font-size: 14px; line-height: 22px">
                    Good news. Your interview booking has been matched.
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
