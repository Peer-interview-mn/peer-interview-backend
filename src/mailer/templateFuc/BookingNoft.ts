export const BookingNotification = (
  userName: string,
  date: string,
  time: string,
  type: string,
) => {
  return `
        <div>
            <p style="font-size: 14px; line-height: 22px;">
                Dear <b>${userName}</b>, <br><br>
                Congratulations! You've successfully scheduled your upcoming interview practice session on the Peer to Peer Interview Platform. Here are the details of your session:
                <br>
                <b>Date: ${date}</b><br>
                <b>Time: ${time}</b><br>
                <b>Practice Area: ${type} SKILLS</b><br>
                <b>
                As part of our commitment to a fruitful and respectful practice environment, we kindly remind you of the following guidelines to ensure a smooth experience for
                both you and your anonymous peer:
                <b>Punctuality</b>: Please arrive at least 5 minutes before your scheduled interview time. This allows you to check your setup and ensures a timely start.<br>
                <b>Respectfulness</b>: The golden rule of our platform is respect. Please be courteous and professional throughout your interaction with your peer.<br>
                <b>Flexibility</b>: We understand that plans can change. If you're unable to attend the scheduled session, we encourage you to reschedule or cancel well in advance.
                This courtesy allows us to offer the slot to another member eager for practice.<br>
                Preparing for Your Session:<br>
                Review the practice area you've chosen and consider any questions or topics you'd like to explore.
                Ensure your technology (webcam, microphone) is working correctly.
                Familiarize yourself with the platform's features, such as screen sharing and the chat function, to enhance your practice session.
                Joining Your Session:
                A link to join the interview will be available in your "Upcoming Interviews" dashboard 15 minutes before your session begins. Simply click on the link to start your
                practice.<br>
                Remember, the identity of your peer will be revealed only at the time of the interview, fostering an unbiased and focused practice environment.<br>
                We're here to support you in your journey to interview excellence. If you have any questions or need assistance, our support team is just a message away.<br>
                Wishing you a productive and insightful practice session!<br><br>
                Best regards,
                The Peer to Peer Interview Platform Team
    </div>`;
};
