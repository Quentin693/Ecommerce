import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContactMessage,
  ContactStatus,
} from './entities/contact-message.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactRepository: Repository<ContactMessage>,
  ) {}

  create(dto: CreateContactDto): Promise<ContactMessage> {
    const message = this.contactRepository.create(dto);
    return this.contactRepository.save(message);
  }

  findAll(): Promise<ContactMessage[]> {
    return this.contactRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(
    id: string,
    status: ContactStatus,
  ): Promise<ContactMessage> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    message.status = status;
    return this.contactRepository.save(message);
  }
}
