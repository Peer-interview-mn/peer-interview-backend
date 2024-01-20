import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from '@/users/users.service';
import { UpdateUserInput } from '@/users/dto/update-user.input';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  async findAll() {
    return await this.usersService.findAll();
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req) {
    const userId = req.user._id;
    return await this.usersService.me(userId);
  }

  @Get(':userName')
  async findName(@Param('userName') userName: string) {
    console.log('user: ', userName);
    return await this.usersService.findByUserName(userName);
  }

  @ApiBearerAuth()
  @Patch('updateProfile')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Request() req, @Body() updateUserInput: UpdateUserInput) {
    const userId = req.user._id;
    return await this.usersService.update(userId, updateUserInput);
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') id: string) {
    return await this.usersService.remove(id);
  }
}
