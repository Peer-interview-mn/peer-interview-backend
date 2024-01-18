import { CreateUserInput } from './create-user.input';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @ApiProperty({})
  @IsNotEmpty({ message: 'The description is required' })
  @IsString({ message: 'The description must be a string' })
  id: string;
}
