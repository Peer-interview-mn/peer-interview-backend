export const ChangeMeetTime = (
  userName: string,
  friendName: string,
  date: string,
  time: string,
  link: string,
) => {
  return `
        <div>
            <p style="font-size: 14px; line-height: 22px;">
                Dear <b>${userName}</b> <br><br>
                Your the interview <a href="${link}">${link}</a> with meeter <b>${friendName}</b> has changed time.
                <br><br>
                <b>Interview Details:</b>
                <ul>
                    <li>Date: ${date}<br></li>
                    <li>Time: ${time}<br></li>
                    <li>Location: <a href="${link}">${link}</a><br></li>
                </ul>
            </p>
            <br>
            Best Regards,
    </div>`;
};
