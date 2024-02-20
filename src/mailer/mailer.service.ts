import { Injectable } from '@nestjs/common';
import { MailDto } from './dto/create-mailer.input';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  BookingNotification,
  Cancelled,
  ChangeMeetTime,
  DisconnectedMeet,
  DoMeetingFriend,
  IgnoreInv,
  InviteCurFriend,
  InviteFriend,
  MailForUnluckyOrSlow,
  Meeting,
  MeetingFriend,
} from '@/mailer/templateFuc';
import * as moment from 'moment-timezone';
import { DoMeeting } from '@/mailer/templateFuc/DoMeeting';
import ical from 'ical-generator';
import { InterviewBooking } from '@/interview-booking/entities/interview-booking.entity';

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
    const { toMail, subject, text, html, iCalContent } = sendMail;
    const transport = this.mailTransport();
    const fromMail = this.configService.get<string>('smtp.from');
    try {
      const send = await transport.sendMail({
        to: Array.isArray(toMail) ? toMail.join(', ') : toMail,
        from: fromMail,
        subject: subject,
        text: text,
        html: html,
        ...(iCalContent && {
          alternatives: {
            contentType: 'text/calendar; charset="utf-8"; method=REQUEST',
            method: 'REQUEST',
            content: iCalContent,
          },
        }),
      });

      return send;
    } catch (e) {
      return e.message;
    } finally {
      transport.close();
    }
  }

  async sendCalendar(toMail: string | string[], content: any) {
    await this.sendMail({
      toMail: toMail,
      subject: 'Peer interview platform',
      text: 'Peer interview platform',
      html: '',
      iCalContent: content,
    });
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
          'user',
          userDate.format('MMMM DD, YYYY'),
          userHour,
          link,
        ),
      });
    }
  }

  async sendInvitationAcceptMail(
    email: string,
    userName: string,
    friendName: string,
    date: Date,
    link: string,
    timeZone: string,
  ) {
    const userDate = moment.tz(date, timeZone || 'UTC');
    const userHour = userDate.format('hh:mm A');
    const forDate = userDate.format('MMMM DD, YYYY');

    await this.sendMail({
      toMail: email,
      subject: `Exciting News - Confirmation and Details for Peer-to-Friend Hard Skill/Soft Skill Interview on ${forDate}`,
      text: 'You have been matched meeting.',
      html: Meeting(
        userName,
        friendName,
        userDate.format('MMMM DD, YYYY'),
        userHour,
        link,
      ),
    });
  }

  async sendInvitationAcceptMailFriend(
    email: string,
    userName: string,
    friendName: string,
    link: string,
  ) {
    await this.sendMail({
      toMail: email,
      subject: `Exciting News - Confirmation and Details for Peer-to-Friend Hard Skill/Soft Skill Interview`,
      text: 'You have been matched meeting.',
      html: MeetingFriend(userName, friendName, link),
    });
  }

  async sendMatchNoft(date: Date, booking: InterviewBooking, content: any) {
    const userDate = moment.tz(date, booking.userId['time_zone'] || 'UTC');
    const userHour = userDate.format('hh:mm A');
    await this.sendMail({
      toMail: booking.userId['email'],
      subject: `Your Interview Session is Booked!`,
      text: 'You have been booked meeting.',
      html: BookingNotification(
        booking.userId['userName'],
        userDate.format('MMMM DD, YYYY'),
        userHour,
        booking.skill_type,
      ),
      iCalContent: content,
    });
  }

  async inviteFriend(mail: string, link: string, inviterName: string) {
    await this.sendMail({
      toMail: mail,
      subject: `${inviterName} Invites You to Join a Practice Interview Session!`,
      text: 'You have been booked meeting.',
      html: InviteFriend(link, mail, inviterName),
    });
  }

  async inviteCurFriend(
    mail: string,
    userName: string,
    link: string,
    inviterName: string,
  ) {
    await this.sendMail({
      toMail: mail,
      subject: `Interview Invitation from ${inviterName}`,
      text: 'You have been booked meeting.',
      html: InviteCurFriend(link, userName, inviterName),
    });
  }

  async changeMeetTime(date: Date, booking: InterviewBooking) {
    const userDate = moment.tz(date, booking.userId['time_zone'] || 'UTC');
    const userHour = userDate.format('hh:mm A');
    const simpleUrl = `https://www.peerinterview.io/app/meet/${booking.meetId}`;
    await this.sendMail({
      toMail: booking.userId['email'],
      subject: `Confirmation and Details for Peer-to-Peer ${booking.skill_type} Skill`,
      text: 'You have been booked meeting.',
      html: ChangeMeetTime(
        booking.userId['userName'],
        booking.connection_userId['userName'],
        userDate.format('MMMM DD, YYYY'),
        userHour,
        simpleUrl,
      ),
    });
  }

  async disConnect(date: Date, booking: InterviewBooking, name: string) {
    const userDate = moment.tz(date, booking.userId['time_zone'] || 'UTC');
    const userHour = userDate.format('hh:mm A');
    await this.sendMail({
      toMail: booking.userId['email'],
      subject: `Disconnected match detail`,
      text: 'You have been booked meeting.',
      html: DisconnectedMeet(
        booking.userId['userName'],
        name,
        userDate.format('MMMM DD, YYYY'),
        userHour,
      ),
    });
  }

  async ignoreInvite(email: string, name: string, fMail: string) {
    await this.sendMail({
      toMail: email,
      subject: `Reject invitation`,
      text: 'You have been booked meeting.',
      html: IgnoreInv(name, fMail),
    });
  }

  async changeMeetTimeFriend(date: Date, booking: InterviewBooking) {
    const userDate = moment.tz(
      date,
      booking.connection_userId['time_zone'] || 'UTC',
    );
    const userHour = userDate.format('hh:mm A');
    const simpleUrl = `https://www.peerinterview.io/app/meet/${booking.meetId}`;
    await this.sendMail({
      toMail: booking.connection_userId['email'],
      subject: `Confirmation and Details for Peer-to-Peer ${booking.skill_type} Skill`,
      text: 'You have been booked meeting.',
      html: ChangeMeetTime(
        booking.connection_userId['userName'],
        booking.userId['userName'],
        userDate.format('MMMM DD, YYYY'),
        userHour,
        simpleUrl,
      ),
    });
  }

  async sendMatchedMail(
    email: string,
    userName: string,
    friendName: string,
    type: string,
    date: Date,
    link: string,
    timeZone: string,
    content: any,
  ) {
    const userDate = moment.tz(date, timeZone || 'UTC');
    const userHour = userDate.format('hh:mm A');
    const forDate = userDate.format('MMMM DD, YYYY');

    await this.sendMail({
      toMail: email,
      subject: `Exciting News - Confirmation and Details for Peer-to-${type} Hard Skill/Soft Skill Interview on ${forDate}`,
      text: 'You have been matched meeting.',
      html: DoMeeting(
        userName,
        friendName,
        type,
        userDate.format('MMMM DD, YYYY'),
        userHour,
        link,
      ),
      iCalContent: content,
    });
  }

  async sendMatchedMailFriend(
    email: string,
    userName: string,
    friendName: string,
    type: string,
    link: string,
  ) {
    await this.sendMail({
      toMail: email,
      subject: `Exciting News - Confirmation and Details for Peer-to-${type} Hard Skill/Soft Skill Interview`,
      text: 'You have been matched meeting.',
      html: DoMeetingFriend(userName, friendName, type, link),
    });
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
    delUser: string,
  ) {
    const userDate = moment.tz(date, timeZone || 'UTC');
    const userHour = userDate.format('hh:mm A');
    const forDate = userDate.format('MMMM DD, YYYY');

    await this.sendMail({
      toMail: email,
      subject: `Details of canceled interview`,
      text: 'You have been unlucky',
      html: Cancelled(userName, forDate, userHour, delUser),
    });
  }

  async createCalendarEvent(
    name: string,
    description: string,
    startDate: Date,
    link: string,
  ) {
    moment.tz.setDefault('UTC');

    const calendar = ical({ name: name });

    const start = moment(startDate).tz('UTC');

    const createEvent = {
      start: start.toDate(),
      end: start.clone().add(2, 'hours').toDate(),
      location: 'Virtual',
      organizer: {
        name: 'PeerInterview',
        email: 'peerinterview@gmail.mn',
      },
      summary: name,
      description: description,
      url: link,
    };

    calendar.createEvent(createEvent);

    return calendar.toString();
  }
}
