export const BookingNotification = (
  userName: string,
  date: string,
  time: string,
  link: string,
) => {
  return `
        <div>
            <p style="font-size: 14px; line-height: 22px;">
                Dear <b>${userName}</b> <br><br>
                I hope this email finds you well. We are excited to confirm your upcoming Peer-to-Peer Hard Skill Interview scheduled for ${date}.
                We appreciate your interest in showcasing your skills and talents with your peer/friend.
                <br><br>
                <b>Interview Details:</b>
                <ul>
                    <li>Date: ${date}<br></li>
                    <li>Time: ${time}<br></li>
                    <li>Location: <a href="${link}">${link}</a><br></li>
                </ul>
                <b>How to Join</b>: To join the interview, please click on the following link: <a href="${link}">${link}</a>.
                Please make sure to be available at the designated location on time.
            </p>
            <br>
            Best Regards,
    </div>`;
};
