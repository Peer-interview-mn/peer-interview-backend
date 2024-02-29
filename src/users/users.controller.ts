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
import {
  ChangePassInput,
  UpdateUserInput,
  UpdateUserInputNew,
} from '@/users/dto/update-user.input';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // get all users
  @Get('')
  async findAll() {
    return await this.usersService.findAll();
  }

  // get login user profile
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req) {
    const userId = req.user._id;
    return await this.usersService.me(userId);
  }

  // Make sure the required fields are filled in
  @ApiBearerAuth()
  @Get('checkFields')
  @UseGuards(AuthGuard('jwt'))
  async checkFields(@Request() req) {
    const userId = req.user._id;
    return await this.usersService.checkFields(userId);
  }

  // find user in username
  @Get(':userName')
  async findName(@Param('userName') userName: string) {
    return await this.usersService.findByUserName(userName);
  }

  // update profile. now not used
  @ApiBearerAuth()
  @Patch('updateProfile')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(@Request() req, @Body() updateUserInput: UpdateUserInput) {
    const userId = req.user._id;
    return await this.usersService.update(userId, updateUserInput);
  }

  // update profile. now use
  @ApiBearerAuth()
  @Patch('v1/updateProfile')
  @UseGuards(AuthGuard('jwt'))
  async updateUserNew(
    @Request() req,
    @Body() updateUserInput: UpdateUserInputNew,
  ) {
    const userId = req.user._id;
    return await this.usersService.updateNew(userId, updateUserInput);
  }

  // user change password
  @ApiBearerAuth()
  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Request() req,
    @Body() changePassInput: ChangePassInput,
  ) {
    const userId = req.user._id;
    return await this.usersService.changePass(userId, changePassInput);
  }

  // delete logged in user
  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Request() req) {
    const userId = req.user._id;
    return await this.usersService.remove(userId);
  }
}
