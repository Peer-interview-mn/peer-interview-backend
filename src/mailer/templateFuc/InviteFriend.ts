export const InviteFriend = (
  url: string,
  userName: string,
  inviterName: string,
) => {
  return `
    <div>
        <p style="font-size: 14px; line-height: 22px;">
          Dear ${userName}, <br><br>
          Exciting news! ${inviterName} has personally invited you to join him for a
          practice interview session on the Peer to Peer Interview Platform—a
          place where aspiring professionals like yourself can hone their
          interview skills, connect with peers, and prepare for success in the job
          market.
          <br><br>
          What's Next?
          ${inviterName} is eager to conduct a practice interview with you, but it looks like
          you haven't had the chance to join our community yet. No worries!
          Getting started is simple and free.
          <br><br>
          Join Us: Follow <a href="${url}">this link</a> to sign up. It only takes a few minutes to
          create your account.
          Complete Your Profile: Help us tailor your experience by adding a bit
          about your professional background and interests.
          Accept the Invite: Once you're set up, you can accept ${inviterName}'s
          interview invitation directly from your dashboard.
          Why join us? The Peer to Peer Interview Platform offers a unique
          opportunity to practice interviewing in real-time, receive constructive
          feedback, and build your confidence—all in a supportive and dynamic
          environment.
          <br><br>
          Don't miss out on this chance to elevate your interview skills alongside
          ${inviterName}. If you have any questions or need assistance, our support team
          is here to help every step of the way.
          <br><br>
          We look forward to welcoming you!
          <br><br>
          Best regards,
          The Peer to Peer Interview Platform Team
      </p>
      <br>
      Best Regards,
    </div>`;
};
