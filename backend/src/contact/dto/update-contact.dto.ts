import { IsIn } from 'class-validator';
import { ContactStatus } from '../entities/contact-message.entity';

export class UpdateContactDto {
  @IsIn(['new', 'read', 'handled'])
  status: ContactStatus;
}
