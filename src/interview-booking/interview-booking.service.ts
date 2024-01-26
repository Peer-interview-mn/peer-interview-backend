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

const { ObjectId } = Types;

@Injectable()
export class InterviewBookingService {
  constructor(
    @InjectModel(InterviewBooking.name)
    private readonly interviewBookingModel: Model<InterviewBooking>,
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
    // const desiredHour = baseMoment.get('hour');

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
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
          dayData: { $push: '$$ROOT' },
        },
      },
    ]);

    return availableDates;
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

    const datas = await this.interviewBookingModel
      .find({
        userId: { $ne: new ObjectId(userId) },
        date: {
          $gte: startOfDay.toDate(),
          $lte: endOfDay.toDate(),
        },
      })
      .sort({ time: 1 })
      .populate({ path: 'userId', select: 'userName skills experience' })
      .lean();

    const points = this.calculateMatchScore(compareData, datas);
    return { data: datas, points: points };
  }

  async calculateMatchScore(
    compareData: InterviewBooking,
    data: InterviewBooking[],
  ) {
    if (!data.length) return [];
    const arr = [];
    console.log('item: ' + compareData['doc']);
    for (const item of data) {
      // for (const i = 0; i < data.length; data) {

      let basePoint = 0;
      if (item.skill_type === compareData.skill_type) {
        basePoint += 2;
      }
      if (item.interview_type === compareData.interview_type) {
        basePoint += 2;
      }
      const skills1 = new Set(item.userId['skills']);
      const skills2 = new Set(compareData.userId['skills']);
      const commonSkills = [...skills1].filter((skill) => skills2.has(skill));
      const skillPoint =
        (commonSkills.length / Math.max(skills1.size, skills2.size)) * 100;
      console.log('skills point: ', skillPoint);
      arr.push(skillPoint + basePoint);
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
}
