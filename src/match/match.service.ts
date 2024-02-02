import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchService {
  create(createMatchDto: CreateMatchDto) {
    return 'This action adds a new match';
  }
}
