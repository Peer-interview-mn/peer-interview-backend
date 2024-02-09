import { Injectable } from '@nestjs/common';
import { MailDto } from './dto/create-mailer.input';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Cancelled, MailForUnluckyOrSlow, Meeting } from '@/mailer/templateFuc';
import * as moment from 'moment-timezone';

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
    userName: string[],
    date: Date,
    link: string,
    timeZone: string[],
  ) {
    for (let i = 0; i < email.length; i++) {
      const userDate = moment.tz(date, timeZone[i] || 'UTC');
      const userHour = userDate.format('hh:mm A');
      const forDate = userDate.format('MMMM DD, YYYY');

      await this.sendMail({
        toMail: email[i],
        subject: `Exciting News - Confirmation and Details for Peer-to-Peer Hard Skill/Soft Skill Interview on ${forDate}`,
        text: 'You have been matched meeting.',
        html: Meeting(
          userName[i],
          userDate.format('MMMM DD, YYYY'),
          userHour,
          link,
        ),
      });
    }
  }

  async unLuckyMail(email: string[], friendName: string, link: string) {
    await this.sendMail({
      toMail: email,
      subject: `Future Opportunity: Peer-to-Peer Hard Skill/Soft Skill Interview`,
      text: 'You have been unlucky',
      html: MailForUnluckyOrSlow(friendName, link),
    });
  }

  async matchCanceledMail(
    email: string,
    userName: string,
    date: Date,
    timeZone: string,
  ) {
    const userDate = moment.tz(date, timeZone || 'UTC');
    const userHour = userDate.format('hh:mm A');
    const forDate = userDate.format('MMMM DD, YYYY');

    await this.sendMail({
      toMail: email,
      subject: `Details of canceled interview`,
      text: 'You have been unlucky',
      html: Cancelled(userName, forDate, userHour),
    });
  }
}
