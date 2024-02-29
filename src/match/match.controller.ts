import {
  Controller,
  Get,
  UseGuards,
  Param,
  Request,
  Query,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MongoSessionInterceptor } from '@/common/interceptors/mongo-session.interceptor';
import { MongoSession } from '@/common/decorators/mongo-session.decorator';
import { ClientSession } from 'mongoose';

@ApiTags('match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // get matching customer interview
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user._id;
    return await this.matchService.findOne(id, userId);
  }

  // cancel the meeting interview
  @ApiBearerAuth()
  @Delete('cancel/:id')
  @UseInterceptors(MongoSessionInterceptor)
  @UseGuards(AuthGuard('jwt'))
  async cancelMatch(
    @Request() req,
    @Param('id') id: string,
    @MongoSession() session: ClientSession,
  ) {
    const userId = req.user._id;
    return await this.matchService.cancelMatch(id, userId, session);
  }

  // get all meeting
  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return await this.matchService.findAll(query);
  }
}
