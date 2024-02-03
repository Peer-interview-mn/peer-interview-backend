import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Match } from '@/match/entities/match.entity';
import { Model } from 'mongoose';
import { MailerService } from '@/mailer/mailer.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name)
    private readonly matchModel: Model<Match>,
  ) {}
  async create(createMatchDto: CreateMatchDto) {
    const match = new this.matchModel(createMatchDto);
    await match.save();

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
    const match = await this.matchModel.findOne({
      _id: id,
      $or: [{ matchedUserOne: userId }, { matchedUserTwo: userId }],
    });

    if (!match) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
    }

    return match;
  }
}
