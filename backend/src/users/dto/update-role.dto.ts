import { IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateRoleDto {
  @IsIn(['admin', 'user'])
  role: UserRole;
}
