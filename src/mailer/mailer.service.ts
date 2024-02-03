import { Injectable } from '@nestjs/common';
import { MailDto } from './dto/create-mailer.input';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Meeting } from '@/mailer/templateFuc';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {}

  private mailTransport() {
    return nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'), // Make sure to use a number for port
      secure: false,
      auth: {
        user: this.configService.get<string>('smtp.user'),
        pass: this.configService.get<string>('smtp.pass'),
      },
      defaults: {
        from: this.configService.get<string>('smtp.from'),
      },
    });
  }

  async sendMail(sendMail: MailDto) {
    const { toMail, subject, text, html } = sendMail;
    const transport = this.mailTransport();
    const fromMail = this.configService.get<string>('smtp.from');
    try {
      const send = await transport.sendMail({
        to: Array.isArray(toMail) ? toMail.join(', ') : toMail,
        from: fromMail,
        subject: subject,
        text: text,
        html: html,
      });

      return send;
    } catch (e) {
      return e.message;
    } finally {
      transport.close();
    }
  }

  async sendMatchMail(
    email: string[],
    date: string,
    time: string,
    link: string,
  ) {
    await this.sendMail({
      toMail: email,
      subject: `Match and Details for meeting`,
      text: 'You have been matched meeting.',
      html: Meeting(date, time, link),
    });
  }
}
