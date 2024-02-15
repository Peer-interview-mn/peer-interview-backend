import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { InterviewBookingService } from './interview-booking.service';
import {
  CreateInterviewBookingDto,
  InvitesToBookingDto,
  InviteToBookingDto,
} from './dto/create-interview-booking.dto';
import { UpdateInterviewBookingDto } from './dto/update-interview-booking.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ClientSession } from 'mongoose';
import { MongoSessionInterceptor } from '@/common/interceptors/mongo-session.interceptor';
import { MongoSession } from '@/common/decorators/mongo-session.decorator';

@ApiTags('interview-booking')
@Controller('interview-booking')
export class InterviewBookingController {
  constructor(
    private readonly interviewBookingService: InterviewBookingService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @UseInterceptors(MongoSessionInterceptor)
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Request() req,
    @Body() createInterviewBookingDto: CreateInterviewBookingDto,
    @MongoSession() session: ClientSession,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.create(
      userId,
      createInterviewBookingDto,
      session,
    );
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return await this.interviewBookingService.findAll(query);
  }

  @ApiBearerAuth()
  @Get('list/me')
  @UseGuards(AuthGuard('jwt'))
  async findMe(@Request() req, @Query() query: Record<string, any>) {
    const userId = req.user._id;
    return await this.interviewBookingService.findMe(userId, query);
  }

  @ApiBearerAuth()
  @Get('list/request/me')
  @UseGuards(AuthGuard('jwt'))
  async findMeRequests(@Request() req, @Query() query: Record<string, any>) {
    const userId = req.user._id;
    return await this.interviewBookingService.findMeRequest(userId, query);
  }

  @ApiBearerAuth()
  @Get('suggest-day/me/:id/:time')
  @UseGuards(AuthGuard('jwt'))
  async suggestMe(
    @Request() req,
    @Param('time') time: string,
    @Param('id') id: string,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.suggestMe(id, userId, time);
  }

  @ApiBearerAuth()
  @Get('suggest-hour/me/:id/:time')
  @UseGuards(AuthGuard('jwt'))
  async suggestMeDay(
    @Request() req,
    @Param('time') time: string,
    @Param('id') id: string,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.getSuggestTimeByDay(
      id,
      userId,
      time,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.interviewBookingService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(MongoSessionInterceptor)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInterviewBookingDto: UpdateInterviewBookingDto,
    @MongoSession() session: ClientSession,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.update(
      userId,
      id,
      updateInterviewBookingDto,
      session,
    );
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user._id;
    return await this.interviewBookingService.remove(userId, id);
  }

  @ApiBearerAuth()
  @Post('invite-to-interview-booking/:id')
  @UseGuards(AuthGuard('jwt'))
  async inviteToBooking(
    @Request() req,
    @Param('id') id: string,
    @Body() inviteToBookingDto: InviteToBookingDto,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.inviteToBooking(
      id,
      userId,
      inviteToBookingDto.email,
    );
  }

  @ApiBearerAuth()
  @Post('v1/invite-to-interview-booking/:id')
  @UseGuards(AuthGuard('jwt'))
  async invitesToBooking(
    @Request() req,
    @Param('id') id: string,
    @Body() inviteToBookingDto: InvitesToBookingDto,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.invitesToBooking(
      id,
      userId,
      inviteToBookingDto.emails,
    );
  }

  @Post('accept-to-booking-invite/:id')
  @UseInterceptors(MongoSessionInterceptor)
  async acceptedToBookingInvite(
    @Param('id') id: string,
    @Body() inviteToBookingDto: InviteToBookingDto,
    @MongoSession() session: ClientSession,
  ) {
    return await this.interviewBookingService.acceptedToBookingInvite(
      id,
      inviteToBookingDto.email,
      session,
    );
  }

  @Get('check-invite-url/:id/:email')
  async checkUrl(@Param('id') id: string, @Param('email') email: string) {
    return await this.interviewBookingService.checkUrl(id, email);
  }
}
