export const IgnoreInv = (userName: string, fMail: string) => {
  return `
        <div>
            <p style="font-size: 14px; line-height: 22px;">
                Dear <b>${userName}</b>,<br><br>
                Your friend ${fMail} has rejected your invitation.   
                <br><br>
            </p>
            <br>
            Best Regards,
    </div>`;
};
