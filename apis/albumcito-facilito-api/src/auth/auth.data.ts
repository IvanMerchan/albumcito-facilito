import { User } from './entities/user.entity';

export const USERS: User[] = [];

export function resetUsers(): void {
  USERS.length = 0;
}
