export const Cancelled = (
  userName: string,
  date: string,
  time: string,
  matchUser: string,
) => {
  return `
     <div>
        <p style="font-size: 14px; line-height: 22px;">
            Dear <b>${userName}</b>,<br><br>
            We regret to inform you that your Peer-to-Peer interview, initially planned to take place on <b>${date}</b> at ${time}, has been cancelled by ${matchUser}.<br>
            Please consider rescheduling the meeting if necessary.<br><br>
            Best regards,
        </p>
     </div>`;
};
