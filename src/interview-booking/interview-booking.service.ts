import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateInterviewBookingDto } from './dto/create-interview-booking.dto';
import { UpdateInterviewBookingDto } from './dto/update-interview-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { InterviewBooking } from '@/interview-booking/entities/interview-booking.entity';
import { Model, Types } from 'mongoose';
import * as moment from 'moment-timezone';
import { InterviewBookingProcessType } from '@/interview-booking/enums/index.enum';
import { MailerService } from '@/mailer/mailer.service';
import { InviteFriend } from '@/mailer/templateFuc/InviteFriend';
import { UsersService } from '@/users/users.service';

const { ObjectId } = Types;

@Injectable()
export class InterviewBookingService {
  constructor(
    @InjectModel(InterviewBooking.name)
    private readonly interviewBookingModel: Model<InterviewBooking>,
    private mailerService: MailerService,
    private usersService: UsersService,
  ) {}

  async helpsToCheckDate(id: string, date: Date, userId: string) {
    const baseMoment = moment.tz(date, 'UTC');
    const twoHoursBefore = baseMoment.clone().subtract(2, 'hours');
    const twoHoursAfter = baseMoment.clone().add(2, 'hours');

    const beforeHave = await this.interviewBookingModel.find({
      _id: { $ne: new ObjectId(id) },
      userId: new ObjectId(userId),
      date: {
        $gte: twoHoursBefore,
        $lte: twoHoursAfter,
      },
      process: {
        $in: [
          InterviewBookingProcessType.PENDING,
          InterviewBookingProcessType.MATCHED,
        ],
      },
    });

    if (beforeHave.length)
      throw new HttpException(
        'You may have already filled this time or you may be interviewing',
        HttpStatus.BAD_REQUEST,
      );

    const currentDate = moment().tz('UTC');
    const minAllowedDate = currentDate.clone().add(2, 'hours');

    const maxAllowedDate = currentDate.clone().add(14, 'days');

    const providedDate = moment(date).tz('UTC');

    if (providedDate.isBefore(minAllowedDate)) {
      throw new HttpException(
        'Interview date must be at least 2 hours in the future.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (providedDate.isAfter(maxAllowedDate)) {
      throw new HttpException(
        'Interview date must be within the next 14 days.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  async create(
    userId: string,
    createInterviewBookingDto: CreateInterviewBookingDto,
  ) {
    try {
      const foundBooking = await this.interviewBookingModel.findOne({
        userId: userId,
        date: null,
      });

      if (!foundBooking) {
        const newBooking = new this.interviewBookingModel({
          userId,
          ...createInterviewBookingDto,
        });

        await newBooking.save();
        return newBooking;
      }

      Object.assign(foundBooking, createInterviewBookingDto);
      await foundBooking.save();
      return foundBooking;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAll() {
    const allBooking = await this.interviewBookingModel
      .find({})
      .populate({
        path: 'userId',
        select: 'userName firstName lastName email skills',
      })
      .exec();
    return allBooking;
  }

  async findOne(id: string) {
    const booking = await this.interviewBookingModel.findById(id);
    if (!booking) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    return booking;
  }

  async findMe(id: string) {
    const booking = await this.interviewBookingModel
      .find({ userId: id })
      .populate({
        path: 'userId',
        select: 'userName firstName lastName email skills',
      })
      .exec();
    return booking;
  }

  async suggestMe(id: string, userId: string, time: string) {
    const baseMoment = moment.tz(time, 'UTC');

    const compareData = await this.interviewBookingModel
      .findOne({
        _id: id,
        userId: userId,
      })
      .populate({ path: 'userId', select: 'userName skills experience' })
      .lean();

    if (!compareData)
      throw new HttpException('not found', HttpStatus.NOT_FOUND);

    const availableDates = await this.interviewBookingModel.aggregate([
      {
        $match: {
          date: {
            $gte: baseMoment.clone().startOf('day').toDate(),
            $lt: baseMoment.clone().add(14, 'days').startOf('day').toDate(),
          },
          userId: { $ne: new ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userName: '$user.userName',
          skills: '$user.skills',
          experience: '$user.experience',
          userId: 1,
          date: 1,
          time: 1,
          process: 1,
          skill_type: 1,
          interview_type: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
          data: { $push: '$$ROOT' },
        },
      },
    ]);

    const points = await this.calculateMatchScore(compareData, availableDates);
    return { points };
  }

  async getSuggestTimeByDay(id: string, userId: string, date: string) {
    const selectedDate = moment.tz(date, 'UTC');
    const startOfDay = selectedDate.clone().startOf('day');
    const endOfDay = selectedDate.clone().endOf('day');

    const compareData = await this.interviewBookingModel
      .findOne({
        _id: id,
        userId: userId,
      })
      .populate({ path: 'userId', select: 'userName skills experience' })
      .lean();

    if (!compareData)
      throw new HttpException('not found', HttpStatus.NOT_FOUND);

    const datas = await this.interviewBookingModel.aggregate([
      {
        $match: {
          userId: { $ne: new ObjectId(userId) },
          date: {
            $gte: startOfDay.toDate(),
            $lte: endOfDay.toDate(),
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userName: '$user.userName',
          skills: '$user.skills',
          experience: '$user.experience',
          userId: 1,
          date: 1,
          time: 1,
          process: 1,
          skill_type: 1,
          interview_type: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%H:%M:%S',
              date: '$date',
            },
          },
          data: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          '_id.time': 1,
        },
      },
    ]);

    const points = await this.calculateMatchScore(compareData, datas);
    return { points };
  }

  async calculateMatchScore(compareData: InterviewBooking, data: any[]) {
    if (!data.length) return [];

    const arr = [];
    const compareSkills = new Set(compareData.userId['skills']);

    for (let i = 0; i < data.length; i++) {
      let maxPoint = 0;
      let maxData: any;

      for (const item of data[i].data) {
        let basePoint = 0;

        if (item.skill_type === compareData.skill_type) {
          basePoint += 2;
        }

        if (item.interview_type === compareData.interview_type) {
          basePoint += 2;
        }

        const skills1 = new Set(item.skills);

        const commonSkills = [...skills1].filter((skill) =>
          compareSkills.has(skill),
        );

        const skillPoint = parseFloat(
          (
            commonSkills.length / Math.max(skills1.size, compareSkills.size)
          ).toFixed(2),
        );

        if (maxPoint <= skillPoint + basePoint) {
          maxPoint = skillPoint + basePoint;
          maxData = item;
        }
      }

      arr.push({ _id: data[i]._id, maxPoint, date: maxData?.date });
      maxPoint = 0;
    }

    return arr;
  }

  async update(
    userId: string,
    id: string,
    updateInterviewBookingDto: UpdateInterviewBookingDto,
  ) {
    const { date } = updateInterviewBookingDto;
    try {
      const booking = await this.interviewBookingModel.findOne({
        _id: id,
        userId: userId,
      });

      if (!booking) throw new HttpException('not found', HttpStatus.NOT_FOUND);
      if (
        booking.process === InterviewBookingProcessType.MATCHED ||
        booking.process === InterviewBookingProcessType.FAILED
      )
        throw new HttpException(
          'This interview booking cannot be changed',
          HttpStatus.BAD_REQUEST,
        );

      if (updateInterviewBookingDto.date) {
        const cond = await this.helpsToCheckDate(id, date, userId);
        if (cond) {
          const baseMoment = moment.tz(date, 'UTC');
          const desiredHour = baseMoment.get('hour');
          booking.time = desiredHour;
        }
      }

      Object.assign(booking, updateInterviewBookingDto);
      await booking.save();
      return booking;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(userId, id: string) {
    const delBooking = await this.interviewBookingModel.findOneAndDelete({
      _id: id,
      userId: userId,
    });
    if (!delBooking) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    return delBooking;
  }

  async inviteToBooking(id: string, userId: string, email: string) {
    try {
      const booking = await this.interviewBookingModel.findOne({
        _id: id,
        userId: userId,
      });

      if (!booking) {
        throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
      }

      const invitationLink = `https://peerinterview.io/invite-to-meeting/?inviteId=${id}`;
      const emailSent = await this.mailerService.sendMail({
        toMail: email,
        subject: 'Invitation to Friend to Friend Interview',
        text: 'You have been invited to join a meeting.',
        html: InviteFriend(invitationLink),
      });

      if (!emailSent) {
        return { success: false, message: 'Failed to send invitation email.' };
      }

      booking.invite_users.push(email);
      await booking.save();

      return { success: true, booking };
    } catch (e) {
      throw new BadRequestException(`Error inviting to booking: ${e.message}`);
    }
  }

  async checkUrl(id: string, email: string) {
    try {
      const booking = await this.interviewBookingModel.findById(id);

      if (!booking) {
        throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
      }
      if (booking.invite_url.includes(email)) {
        throw new HttpException(
          'Oops!. You are not invited',
          HttpStatus.NOT_FOUND,
        );
      }
      if (
        booking.connection_userId ||
        booking.process === InterviewBookingProcessType.MATCHED
      ) {
        throw new HttpException(
          'Oops!. This booking bas already been matched',
          HttpStatus.NOT_FOUND,
        );
      }

      const user = this.usersService.findOne(email);
      if (!user) {
        throw new HttpException(
          'This email is not registered. Please register on this platform to accept the invitation.',
          HttpStatus.NOT_FOUND,
        );
      }

      return booking;
    } catch (e) {
      throw new BadRequestException(`Error inviting to booking: ${e.message}`);
    }
  }

  async acceptedToBookingInvite(id: string, email: string) {
    try {
      const booking = await this.interviewBookingModel.findById(id);

      if (!booking) {
        throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
      }

      if (booking.invite_url.includes(email)) {
        throw new HttpException(
          'Oops!. You are not invited',
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        booking.connection_userId ||
        booking.process === InterviewBookingProcessType.MATCHED
      ) {
        throw new HttpException(
          'Oops!. This booking bas already been matched',
          HttpStatus.NOT_FOUND,
        );
      }

      const acceptingUser = await this.usersService.findOne(email);
      if (!acceptingUser) {
        throw new HttpException(
          'This email is not registered. Please register on this platform to accept the invitation.',
          HttpStatus.NOT_FOUND,
        );
      }

      booking.connection_userId = acceptingUser._id;
      booking.process = InterviewBookingProcessType.MATCHED;
      await booking.save();
      return booking;
    } catch (e) {
      throw new BadRequestException(
        `Error accepting booking invite: ${e.message}`,
      );
    }
  }
}
