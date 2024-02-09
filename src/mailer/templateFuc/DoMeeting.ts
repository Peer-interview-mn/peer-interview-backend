export const DoMeeting = (
  userName: string,
  matchUser: string,
  type: string,
  date: string,
  time: string,
  link: string,
) => {
  return `
    <div>
        Dear <b>${userName}</b> <br><br>
        You have matched to meet ${matchUser}. The Peer-to-${type} Hard Skill Interview on ${date} is scheduled, making our upcoming session even more promising.
        <br><br>
        <b>Here are the interview details:</b>
        <ul>
          <li>Date: ${date}</li>
          <li>Time: ${time}</li>
          <li>Simply click on the following link: <a href="${link}">${link}</a>. Please ensure you're ready and connected at the specified time.
          Thank you for bringing your skills and insights to the table.</li>
        </ul>
        <b>
        Best Regards,
    </div>`;
};
