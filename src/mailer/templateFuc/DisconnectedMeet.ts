export const DisconnectedMeet = (
  userName: string,
  friendName: string,
  date: string,
  time: string,
) => {
  return `
        <div>
            <p style="font-size: 14px; line-height: 22px;">
                Dear <b>${userName}</b>,<br><br>
                We regret to inform you that your interview scheduled for ${date} at ${time} with interviewer <b>${friendName}</b> was disconnected. Your interview booking has been changed to pending.  
                <br><br>
            </p>
            <br>
            Best Regards,
    </div>`;
};
