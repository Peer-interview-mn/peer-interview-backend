export const DoMeetingFriend = (
  userName: string,
  matchUser: string,
  type: string,
  link: string,
) => {
  return `
    <div>
        Dear <b>${userName}</b> <br><br>
        You have matched to meet <b>${matchUser}</b>. The Peer-to-${type} Hard Skill Interview, making our upcoming session even more promising.
        <br><br>
        <b>Here are the interview details:</b>
        <ul>
          <li>Simply click on the following link: <a href="${link}">${link}</a>.<br> Please ensure you're ready and connected at the specified time.
          Thank you for bringing your skills and insights to the table.</li>
        </ul>
        <b>
        Best Regards,
    </div>`;
};
