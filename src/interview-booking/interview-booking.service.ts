import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInterviewBookingDto } from './dto/create-interview-booking.dto';
import { UpdateInterviewBookingDto } from './dto/update-interview-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { InterviewBooking } from '@/interview-booking/entities/interview-booking.entity';
import { Model } from 'mongoose';

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

    const currentDate = new Date();
    const maxAllowedDate = new Date(currentDate);
    maxAllowedDate.setDate(currentDate.getDate() + 14);

    if (date > maxAllowedDate) {
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
    const allBooking = await this.interviewBookingModel.find({});
    return allBooking;
  }

  async findOne(id: string) {
    const booking = await this.interviewBookingModel.findById(id);
    if (!booking) throw new HttpException('not found', HttpStatus.NOT_FOUND);
    return booking;
  }

  update(id: number, updateInterviewBookingDto: UpdateInterviewBookingDto) {
    return `This action updates a #${id} interviewBooking`;
  }

  remove(id: number) {
    return `This action removes a #${id} interviewBooking`;
  }
}
