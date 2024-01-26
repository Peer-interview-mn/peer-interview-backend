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
} from '@nestjs/common';
import { InterviewBookingService } from './interview-booking.service';
import { CreateInterviewBookingDto } from './dto/create-interview-booking.dto';
import { UpdateInterviewBookingDto } from './dto/update-interview-booking.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('interview-booking')
@Controller('interview-booking')
export class InterviewBookingController {
  constructor(
    private readonly interviewBookingService: InterviewBookingService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Request() req,
    @Body() createInterviewBookingDto: CreateInterviewBookingDto,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.create(
      userId,
      createInterviewBookingDto,
    );
  }

  @Get()
  async findAll() {
    return await this.interviewBookingService.findAll();
  }
  @ApiBearerAuth()
  @Get('list/me')
  @UseGuards(AuthGuard('jwt'))
  async findMe(@Request() req) {
    const userId = req.user._id;
    return await this.interviewBookingService.findMe(userId);
  }

  @ApiBearerAuth()
  @Get('suggest/me/:time')
  @UseGuards(AuthGuard('jwt'))
  async suggestMe(@Request() req, @Param('time') time: string) {
    const userId = req.user._id;
    return await this.interviewBookingService.suggestMe(userId, time);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.interviewBookingService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInterviewBookingDto: UpdateInterviewBookingDto,
  ) {
    const userId = req.user._id;
    return await this.interviewBookingService.update(
      userId,
      id,
      updateInterviewBookingDto,
    );
  }

  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user._id;
    return await this.interviewBookingService.remove(userId, id);
  }
}
