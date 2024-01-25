import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInterviewBookingDto } from './dto/create-interview-booking.dto';
import { UpdateInterviewBookingDto } from './dto/update-interview-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { InterviewBooking } from '@/interview-booking/entities/interview-booking.entity';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import { InterviewBookingProcessType } from '@/interview-booking/enums/index.enum';

@Injectable()
export class InterviewBookingService {
  constructor(
    @InjectModel(InterviewBooking.name)
    private readonly interviewBookingModel: Model<InterviewBooking>,
  ) {}

  async create(
    userId: string,
    createInterviewBookingDto: CreateInterviewBookingDto,
  ) {
    const { date } = createInterviewBookingDto;

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

    const booking = new this.interviewBookingModel({
      userId,
      ...createInterviewBookingDto,
    });
    return await booking.save();
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

  async suggestMe(time: string) {
    const baseMoment = moment.tz(time, 'UTC'); // Replace 'YourTimeZone' with the desired time zone

    const availabilityArray: boolean[] = [];

    for (let i = 0; i < 14; i++) {
      const currentDate = baseMoment.clone().add(i, 'days');

      const currentDateTime = currentDate
        .clone()
        .set({ hour: 14, minute: 0, second: 0 });

      console.log(' date: ', currentDateTime);
      console.log('find date: ', currentDateTime.toDate());

      const isAvailable = await this.interviewBookingModel.exists({
        date: currentDateTime.toDate(),
      });

      console.log('is: ', isAvailable);

      availabilityArray.push(!!isAvailable);
    }

    return availabilityArray;
  }

  async update(
    userId: string,
    id: string,
    updateInterviewBookingDto: UpdateInterviewBookingDto,
  ) {
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

    Object.assign(booking, updateInterviewBookingDto);
    await booking.save();
    return booking;
  }

  remove(id: string) {
    return `This action removes a #${id} interviewBooking`;
  }
}
