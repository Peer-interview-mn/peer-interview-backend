export const InviteFriend = (url: string, inviterName: string) => {
  return `
    <div>
        <p style="font-size: 14px; line-height: 22px;">
          Hello! <br><br>
          You have been invited to a meeting by <b>${inviterName}</b> on the Peer to Peer Interview Platform.
          Please use the following link to join the meeting:
          <br><br>
          <a href="${url}" style="text-decoration: none; color: #007bff;">Join Meeting</a>
          <br><br>
          If you have any questions or issues, feel free to contact us.
          We look forward to seeing you at the meeting!
      </p>
      <br>
      Best Regards,
    </div>`;
};
