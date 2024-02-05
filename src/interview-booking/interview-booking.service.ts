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
import {
  InterviewBookingProcessType,
  InterviewType,
} from '@/interview-booking/enums/index.enum';
import { MailerService } from '@/mailer/mailer.service';
import { UsersService } from '@/users/users.service';
import { BookingNotification, InviteFriend } from '@/mailer/templateFuc';
import { MatchService } from '@/match/match.service';

const { ObjectId } = Types;

@Injectable()
export class InterviewBookingService {
  constructor(
    @InjectModel(InterviewBooking.name)
    private readonly interviewBookingModel: Model<InterviewBooking>,
    private mailerService: MailerService,
    private usersService: UsersService,
    private matchService: MatchService,
  ) {}

  async helpsToCheckDate(id: string, date: Date, userId: string) {
    const baseMoment = moment.tz(date, 'UTC');
    const twoHoursBefore = baseMoment.clone().subtract(2, 'hours');
    const twoHoursAfter = baseMoment.clone().add(2, 'hours');

    const beforeHave = await this.interviewBookingModel.find({
      _id: { $ne: new ObjectId(id) },
      userId: new ObjectId(userId),
      date: {
        $gte: twoHoursBefore.toDate(),
        $lte: twoHoursAfter.toDate(),
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

  private async updateProcessWithSession() {
    const session = await this.interviewBookingModel.startSession();
    session.startTransaction();
    const pendingStatus = InterviewBookingProcessType.PENDING;
    const nowDate = new Date();
    const currentDate = moment.tz(nowDate, 'UTC');

    try {
      await this.interviewBookingModel.updateMany(
        {
          date: { $lt: currentDate.toDate() },
          process: pendingStatus,
        },
        { $set: { process: InterviewBookingProcessType.CANCELLED } },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async updateProcess() {
    const pendingStatus = InterviewBookingProcessType.PENDING;
    const nowDate = new Date();
    const currentDate = moment.tz(nowDate, 'UTC');

    try {
      await this.interviewBookingModel.updateMany(
        {
          date: { $lt: currentDate.toDate() },
          process: pendingStatus,
        },
        { $set: { process: InterviewBookingProcessType.CANCELLED } },
      );
    } catch (error) {
      throw error;
    }
  }

  private async updateProcessMeWithSession(userId: string) {
    const session = await this.interviewBookingModel.startSession();
    session.startTransaction();
    const pendingStatus = InterviewBookingProcessType.PENDING;
    const nowDate = new Date();
    const currentDate = moment.tz(nowDate, 'UTC');

    try {
      await this.interviewBookingModel.updateMany(
        {
          userId: userId,
          date: { $lt: currentDate.toDate() },
          process: pendingStatus,
        },
        { $set: { process: InterviewBookingProcessType.CANCELLED } },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async updateProcessMe(userId: string) {
    const pendingStatus = InterviewBookingProcessType.PENDING;
    const nowDate = new Date();
    const currentDate = moment.tz(nowDate, 'UTC');

    try {
      await this.interviewBookingModel.updateMany(
        {
          userId: userId,
          date: { $lt: currentDate.toDate() },
          process: pendingStatus,
        },
        { $set: { process: InterviewBookingProcessType.CANCELLED } },
      );
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: Record<string, any>) {
    const { select, sort, page, limit } = query;
    ['select', 'sort', 'page', 'limit', 'search'].forEach(
      (el: string) => delete query[el],
    );

    await this.updateProcess();

    const skip = (page - 1) * limit;

    const totalPolls = await this.interviewBookingModel.countDocuments(query);
    const totalPages = Math.ceil(totalPolls / limit);

    const allBooking = await this.interviewBookingModel
      .find(query, select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'userName firstName lastName email skills',
      })
      .populate({
        path: 'connection_userId',
        select: 'userName firstName lastName email skills',
      })
      .exec();

    return { data: allBooking, pages: totalPages };
  }

  async findOne(id: string) {
    const booking = await this.interviewBookingModel.findById(id);
    if (!booking) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    return booking;
  }

  async findMe(id: string, query: Record<string, any>) {
    const { select, sort, page, limit } = query;
    ['select', 'sort', 'page', 'limit', 'search', 'userId'].forEach(
      (el: string) => delete query[el],
    );

    const options = {
      userId: id,
      ...query,
    };

    const skip = (page - 1) * limit;
    try {
      await this.updateProcessMe(id);

      const totalPolls = await this.interviewBookingModel.countDocuments(
        options,
      );
      const totalPages = Math.ceil(totalPolls / limit);

      const booking = await this.interviewBookingModel
        .find(options, select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'userId',
          select: 'userName firstName lastName email skills',
        })
        .populate({
          path: 'connection_userId',
          select: 'userName firstName lastName email skills',
        })
        .exec();

      return { data: booking, pages: totalPages };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async suggestMe(id: string, userId: string, time: string) {
    const baseMoment = moment.tz(time, 'UTC');
    try {
      const compareData = await this.interviewBookingModel
        .findOne({
          _id: id,
          userId: userId,
        })
        .populate({ path: 'userId', select: 'userName skills experience' })
        .lean();

      if (!compareData) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      const availableDates = await this.interviewBookingModel.aggregate([
        {
          $match: {
            date: {
              $gte: baseMoment.clone().startOf('day').toDate(),
              $lt: baseMoment.clone().add(14, 'days').startOf('day').toDate(),
            },
            userId: { $ne: new ObjectId(userId) },
            interview_type: { $ne: InterviewType.FRIEND },
            process: {
              $nin: [
                InterviewBookingProcessType.MATCHED,
                InterviewBookingProcessType.CANCELLED,
                InterviewBookingProcessType.FAILED,
              ],
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
                format: '%Y-%m-%d',
                date: '$date',
              },
            },
            data: { $push: '$$ROOT' },
          },
        },
      ]);

      const points = await this.calculateMatchScore(
        compareData,
        availableDates,
      );
      return { points };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getSuggestTimeByDay(id: string, userId: string, date: string) {
    const selectedDate = moment.tz(date, 'UTC');
    const startOfDay = selectedDate.clone().startOf('day');
    const endOfDay = selectedDate.clone().endOf('day');

    try {
      const compareData = await this.interviewBookingModel
        .findOne({
          _id: id,
          userId: userId,
        })
        .populate({ path: 'userId', select: 'userName skills experience' })
        .lean();

      if (!compareData) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      const datas = await this.interviewBookingModel.aggregate([
        {
          $match: {
            userId: { $ne: new ObjectId(userId) },
            date: {
              $gte: startOfDay.toDate(),
              $lte: endOfDay.toDate(),
            },
            interview_type: { $ne: InterviewType.FRIEND },
            process: {
              $nin: [
                InterviewBookingProcessType.MATCHED,
                InterviewBookingProcessType.CANCELLED,
                InterviewBookingProcessType.FAILED,
              ],
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
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getSuggestThisMoment(id: string, userId: string, date: Date) {
    const selectedDate = moment.tz(date, 'UTC');

    try {
      const compareData = await this.interviewBookingModel
        .findOne({
          _id: id,
          userId: userId,
        })
        .populate({ path: 'userId', select: 'userName skills experience' })
        .lean();

      if (!compareData) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      const datas = await this.interviewBookingModel.aggregate([
        {
          $match: {
            userId: { $ne: new ObjectId(userId) },
            date: selectedDate.toDate(),
            interview_type: { $ne: InterviewType.FRIEND },
            process: {
              $nin: [
                InterviewBookingProcessType.MATCHED,
                InterviewBookingProcessType.CANCELLED,
                InterviewBookingProcessType.FAILED,
              ],
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
                format: '%Y-%m-%d %H:%M:%S',
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
    } catch (e) {
      throw new BadRequestException(e.message);
    }
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

      arr.push({
        _id: data[i]._id,
        maxPoint,
        date: maxData?.date,
        bestId: maxData?.userId,
        bestCore: maxData?._id,
      });
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
    delete updateInterviewBookingDto['userId'];
    try {
      const booking = await this.interviewBookingModel
        .findOneAndUpdate(
          {
            _id: id,
            userId: userId,
            process: { $in: [InterviewBookingProcessType.PENDING] },
          },
          { ...updateInterviewBookingDto },
          { new: true },
        )
        .populate({ path: 'userId', select: 'email userName time_zone' })
        .exec();

      if (!booking) {
        {
          throw new HttpException(
            'This interview booking cannot be changed',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (date) {
        await this.helpsToCheckDate(id, date, userId);
        const desiredHour = moment.tz(date, 'UTC').get('hour');
        const userDate = moment.tz(date, booking.userId['time_zone'] || 'UTC');
        booking.time = desiredHour;

        if (!booking.connection_userId) {
          booking.process = InterviewBookingProcessType.PENDING;
        }

        const userHour = userDate.format('hh:mm A');

        await this.mailerService.sendMail({
          toMail: booking.userId['email'],
          subject: `Confirmation and Details for Peer-to-Peer ${booking.skill_type} Skill`,
          text: 'You have been booked meeting.',
          html: BookingNotification(
            booking.userId['userName'],
            userDate.format('MMMM DD, YYYY'),
            userHour,
            'https://www.peerinterview.io/app',
          ),
        });
      }

      if (!booking.invite_url) {
        booking.invite_url = `https://peerinterview.io/app/invite-to-meeting/${id}`;
      }

      await booking.save();

      const thisMomentMatch = await this.getSuggestThisMoment(
        id,
        userId,
        booking.date,
      );
      if (thisMomentMatch.points.length) {
        const myBestMoment = thisMomentMatch.points[0]?.bestCore;
        const myBestMomentUser = thisMomentMatch.points[0]?.bestId;

        const match = await this.matchService.create({
          matchedUserOne: booking.userId,
          matchedUserTwo: myBestMomentUser,
          date: booking.date,
          skill_type: booking.skill_type,
          interview_type: booking.interview_type,
        });
        if (match) {
          booking.connection_userId = myBestMomentUser;
          booking.process = InterviewBookingProcessType.MATCHED;
          await this.userMatchedAndSendMail(
            myBestMoment,
            myBestMomentUser,
            userId,
            match._id,
          );

          await this.mailerService.sendMatchMail(
            [booking.userId['email']],
            [booking.userId['userName']],
            date,
            `https://www.peerinterview.io/app/meet/${match._id}`,
            [booking.userId['time_zone']],
          );
        }
      }
      await booking.save();
      return booking;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async userMatchedAndSendMail(
    id: string,
    userId: string,
    conUser: string,
    matchId: string,
  ) {
    const booking = await this.interviewBookingModel
      .findOneAndUpdate(
        { _id: id, userId: userId },
        {
          process: InterviewBookingProcessType.MATCHED,
          connection_userId: conUser,
        },
        { new: true },
      )
      .populate({ path: 'userId', select: 'email' })
      .exec();

    await this.mailerService.sendMatchMail(
      [booking.userId['email']],
      [booking.userId['userName']],
      booking.date,
      `https://www.peerinterview.io/app/meet/${matchId}`,
      [booking.userId['time_zone']],
    );

    return booking;
  }

  async remove(userId: string, id: string) {
    const booking = await this.interviewBookingModel.findOne({
      _id: id,
      userId: userId,
    });
    if (!booking) throw new HttpException('not found', HttpStatus.NOT_FOUND);

    if (booking.process === InterviewBookingProcessType.MATCHED) {
      throw new HttpException(
        'This interview booking cannot be changed',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.interviewBookingModel.findOneAndDelete({
      _id: id,
      userId: userId,
    });
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

      if (booking.invite_users.length > 5) {
        throw new HttpException(
          'Friend invite limit reached',
          HttpStatus.BAD_GATEWAY,
        );
      }
      if (booking.invite_users.includes(email)) {
        throw new HttpException(
          'This email is already invited',
          HttpStatus.BAD_REQUEST,
        );
      }

      const invitationLink = `https://peerinterview.io/app/invite-to-meeting/${id}`;
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

  private async checkInviteConditions(
    booking: InterviewBooking,
    email: string,
  ) {
    const currentDate = moment().tz('UTC');
    const minAllowedDate = currentDate.clone().add(10, 'minutes');
    const providedDate = moment(booking.date).tz('UTC');

    if (providedDate.isBefore(minAllowedDate)) {
      throw new HttpException(
        'You must receive this invitation at least 10 minutes in advance!',
        HttpStatus.BAD_REQUEST,
      );
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
        'Oops!. This booking has already been matched',
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      booking.process === InterviewBookingProcessType.CANCELLED ||
      booking.process === InterviewBookingProcessType.FAILED
    ) {
      throw new HttpException(
        'Oops!. This booking has timeout',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkUrl(id: string, email: string) {
    try {
      const booking = await this.interviewBookingModel.findById(id);

      if (!booking) {
        throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
      }

      await this.checkInviteConditions(booking, email);

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
      const booking = await this.interviewBookingModel
        .findById(id)
        .populate({ path: 'userId', select: 'email time_zone userName' })
        .exec();

      if (!booking) {
        throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
      }

      await this.checkInviteConditions(booking, email);

      const acceptingUser = await this.usersService.findOne(email);
      if (!acceptingUser) {
        throw new HttpException(
          'This email is not registered. Please register on this platform to accept the invitation.',
          HttpStatus.NOT_FOUND,
        );
      }

      const match = await this.matchService.create({
        matchedUserOne: booking.userId,
        matchedUserTwo: acceptingUser._id,
        date: booking.date,
        skill_type: booking.skill_type,
        interview_type: booking.interview_type,
      });

      if (!match) {
        throw new BadRequestException('Failed to accepted');
      }

      const inUserBooking = new this.interviewBookingModel({
        userId: acceptingUser._id,
        process: InterviewBookingProcessType.MATCHED,
        connection_userId: booking.userId,
        skill_type: booking.skill_type,
        interview_type: booking.interview_type,
        date: booking.date,
      });

      booking.connection_userId = acceptingUser._id;
      booking.process = InterviewBookingProcessType.MATCHED;

      await inUserBooking.save();
      await booking.save();

      console.log('ac: ', acceptingUser, '\n dahudhas: ', booking);
      console.log(
        'ac: ',
        booking.userId['time_zone'],
        '\n dahudhas: ',
        acceptingUser.time_zone,
      );

      await this.mailerService.sendMatchMail(
        [booking.userId['email'], acceptingUser.email],
        [booking.userId['userName'], acceptingUser.userName],
        booking.date,
        `https://www.peerinterview.io/app/meet/${match._id}`,
        [booking.userId['time_zone'], acceptingUser.time_zone],
      );

      const sendUnlucky = booking.invite_users.filter(
        (user) => user !== acceptingUser.email,
      );

      await this.mailerService.unLuckyMail(
        sendUnlucky,
        booking.userId['userName'],
        'https://www.peerinterview.io/app',
      );

      return inUserBooking;
    } catch (e) {
      throw new BadRequestException(
        `Error accepting booking invite: ${e.message}`,
      );
    }
  }
}
