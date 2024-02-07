export const Cancelled = (userName: string, date: string, time: string) => {
  return `
     <div>
        <p style="font-size: 14px; line-height: 22px;">
            Dear <b>${userName}</b>,<br><br>
            We regret to inform you that your Peer-to-Peer interview, initially planned to take place on <b>${date}</b> at ${time}, is currently cancelled.<br>
            Please consider scheduling a new meeting with your peer/friend if necessary.<br><br>
            Best regards,
        </p>
     </div>`;
};
