export const Meeting = (
  userName: string,
  friendName: string,
  date: string,
  time: string,
  link: string,
) => {
  return `
    <div>
        Dear <b>${userName}</b> <br><br>
        Your friend ${friendName} accepted your invitation of  the Peer-to-Friend Hard Skill Interview on ${date}, has made our upcoming session even more promising.
        <br><br>
        <b>Here are the interview details:</b>
        <ul>
          <li>Date: ${date}</li>
          <li>Time: ${time}</li>
          <li>Simply click on the following link: <a href="${link}">${link}</a>. <br>Please ensure you're ready and connected at the specified time.
          Thank you for bringing your skills and insights to the table.</li>
        </ul>
        <b>
        Best Regards,
    </div>`;
};
