import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '@/users/users.service';
import { UpdateUserInput } from '@/users/dto/update-user.input';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':userId')
  async findOne(@Param('userId') id: string) {
    return await this.usersService.findOneId(id);
  }

  @Patch('userId')
  async updateUser(
    @Param('userId') id: string,
    @Body() updateUserInput: UpdateUserInput,
  ) {
    return await this.usersService.update(id, updateUserInput);
  }
}
