export class CreateMailerInput {}

export type MailDto = {
  toMail: string | string[];
  subject: string;
  text: string;
  html: string;
};
