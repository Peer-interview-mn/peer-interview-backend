export class CreateMailerInput {}

export type MailDto = {
  toMail: string;
  subject: string;
  text: string;
  html: string;
};
