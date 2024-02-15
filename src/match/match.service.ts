import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Match } from '@/match/entities/match.entity';
import { ClientSession, Model } from 'mongoose';
import { InterviewBooking } from '@/interview-booking/entities/interview-booking.entity';
import { InterviewBookingProcessType } from '@/interview-booking/enums/index.enum';
import { MailerService } from '@/mailer/mailer.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name)
    private readonly matchModel: Model<Match>,
    @InjectModel(InterviewBooking.name)
    private readonly interviewBookingModel: Model<InterviewBooking>,
    private mailerService: MailerService,
  ) {}
  async create(createMatchDto: CreateMatchDto, session: ClientSession) {
    const match = new this.matchModel(createMatchDto);
    await match.save({ session });

    return match;
  }

  async findAll(query: Record<string, any>) {
    const { select, sort, page, limit } = query;
    ['select', 'sort', 'page', 'limit', 'search'].forEach(
      (el: string) => delete query[el],
    );

    const skip = (page - 1) * limit;

    const totalPolls = await this.matchModel.countDocuments(query);
    const totalPages = Math.ceil(totalPolls / limit);

    const allBooking = await this.matchModel
      .find(query, select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    return { data: allBooking, pages: totalPages };
  }

  async findOne(id: string, userId: string) {
    const match = await this.matchModel
      .findOne({
        _id: id,
        $or: [{ matchedUserOne: userId }, { matchedUserTwo: userId }],
      })
      .populate({ path: 'matchedUserOne' })
      .populate({ path: 'matchedUserTwo' })
      .exec();

    if (!match) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }

    return match;
  }

  async cancelMatch(id: string, userId: string, session: ClientSession) {
    try {
      const cMatch = await this.matchModel.findOneAndDelete(
        {
          _id: id,
          $or: [{ matchedUserOne: userId }, { matchedUserTwo: userId }],
        },
        {
          session: session,
        },
      );

      if (!cMatch) {
        throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
      }

      const delBooking = await this.interviewBookingModel.findOneAndDelete(
        {
          meetId: id,
          userId: userId,
        },
        { session: session },
      );

      if (!delBooking) {
        throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
      }

      const rejectBooking = await this.interviewBookingModel
        .findOne({
          meetId: id,
          userId: delBooking.connection_userId,
        })
        .populate({ path: 'userId', select: 'userName email time_zone' });

      if (!rejectBooking) {
        throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
      }

      rejectBooking.process = InterviewBookingProcessType.PENDING;
      rejectBooking.connection_userId = null;
      rejectBooking.meetId = null;

      await rejectBooking.save({ session });

      await this.mailerService.matchCanceledMail(
        rejectBooking.userId['email'],
        rejectBooking.userId['userName'],
        rejectBooking.date,
        rejectBooking.userId['time_zone'],
      );

      return cMatch;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
