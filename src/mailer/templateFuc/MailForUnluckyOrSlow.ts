export const MailForUnluckyOrSlow = (friendName: string, link: string) => {
  return `
  <div>
  <p style="font-size: 14px; line-height: 22px;">
      We informed you that your friend ${friendName}'s scheduled with another friend on this time. Your unique skills and talents, You'll be more than happy to keep you in the loop for our upcoming sessions with your friend and peers.  Join and Enjoy Link : ${link}
      Looking forward to the possibility of having you join us in the future!
      <br>
      Best Regards,
  </p>
</div>`;
};
