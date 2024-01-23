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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.interviewBookingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterviewBookingDto: UpdateInterviewBookingDto,
  ) {
    return this.interviewBookingService.update(+id, updateInterviewBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interviewBookingService.remove(+id);
  }
}
