export const ForgotPassword = (resetToken: string) => {
  return `
    <div>
        <h2 style="color: #333;">Password Reset</h2>
        <div>
            <p style="font-size: 14px; line-height: 22px;">
                We have received a request to update your account password related to our peer-to-peer chat platform.
                Copy the code below to proceed with password reset: <b>${resetToken}</b>
            </p>
            <p style="font-size: 14px; line-height: 22px;">
                If you did not request a password reset, please ignore this email.
                Your account security is important to us, and no changes will be made without your confirmation.
            </p>
        </div>
    </div>`;
};
