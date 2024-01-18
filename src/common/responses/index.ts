import { User } from '@/users/entities/user.entity';

export class UserResponse {
  user: User;
  token: string;
}

export class MailResponse {
  success: boolean;
}
