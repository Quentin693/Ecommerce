import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CarCategory = 'supercar' | 'luxury' | 'suv' | 'convertible';
export type Transmission = 'automatic' | 'manual';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerDay: number;

  @Column()
  category: CarCategory;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('simple-json', { nullable: true })
  images: string[];

  @Column({ default: true })
  available: boolean;

  @Column('simple-json', { nullable: true })
  features: string[];

  @Column({ nullable: true })
  seats: number;

  @Column({ default: 'automatic' })
  transmission: Transmission;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
