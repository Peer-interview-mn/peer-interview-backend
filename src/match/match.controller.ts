import {
  Controller,
  Get,
  UseGuards,
  Param,
  Request,
  Query,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user._id;
    return await this.matchService.findOne(id, userId);
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    return await this.matchService.findAll(query);
  }
}
