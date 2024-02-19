export const InviteCurFriend = (
  url: string,
  userName: string,
  inviterName: string,
) => {
  return `
    <div>
        <p style="font-size: 14px; line-height: 22px;">
          Dear ${userName}, <br><br>
          Great news! ${inviterName} has invited you to join him in a practice interview session on
          the Peer to Peer Interview Platform. It's an excellent opportunity for both of you to
          sharpen your skills and get ready for your next big opportunity.
          <br><br>
          Session Details:
          <br><br>
          Inviter: ${inviterName}
          Nature of the Invite: ${inviterName} wants to interview with you.
          To accept this invitation and see more details, please visit your "Upcoming
          Interviews" section on the platform. From there, you can confirm your participation,
          review the session focus, and start preparing.
          <br><br>
          Why Participate?
          These practice sessions are designed to mimic real interview scenarios, giving you
          the chance to test your skills, receive immediate feedback, and identify areas for
          improvement—all in a friendly and constructive setting.
          <br><br>
          ${inviterName} is looking forward to the session with you. Let's make it a productive and
          insightful experience!
          <br><br>
          If you have any questions or need to reschedule, please feel free to reach out directly
          through the platform.
          <br><br>
          See you there!
          <br><br>
          Best regards,
          The Peer to Peer Interview Platform Team
      </p>
      <br>
      Best Regards,
    </div>`;
};
