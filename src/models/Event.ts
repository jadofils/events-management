// src/entity/Event.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
  } from 'typeorm';
  import {
    IsUUID,
    IsNotEmpty,
    Length,
    IsOptional,
    IsEnum,
  } from 'class-validator';
  
  export enum EventType {
    PUBLIC = 'public',
    PRIVATE = 'private',
  }
  
  @Entity('events')
  export class Event {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID('4', { message: 'eventId must be a valid UUID' })
    eventId!: string;
  
    @Column()
    @IsNotEmpty({ message: 'Event title is required' })
    @Length(3, 100, {
      message: 'Event title must be between $constraint1 and $constraint2 characters',
    })
    eventTitle!: string;
  
    @Column({ nullable: true })
    @IsOptional()
    @Length(0, 1000, {
      message: 'Description must be at most $constraint2 characters long',
    })
    description!: string;
  
    @Column({ nullable: true })
    @IsOptional()
    @Length(0, 50, {
      message: 'Event category must be at most $constraint2 characters long',
    })
    eventCategory!: string;
  
    @Column({
      type: 'enum',
      enum: EventType,
      default: EventType.PUBLIC,
    })
    @IsEnum(EventType, {
      message: 'Event type must be one of: public, private',
    })
    eventType!: EventType;
  
    @Column()
    @IsNotEmpty({ message: 'Organizer ID is required' })
    @IsUUID('4', { message: 'Organizer ID must be a valid UUID' })
    organizerId!: string;
  
    @Column()
    @IsNotEmpty({ message: 'Organization ID is required' })
    @IsUUID('4', { message: 'Organization ID must be a valid UUID' })
    organizationId!: string;
  
    @Column()
    @IsNotEmpty({ message: 'Venue ID is required' })
    @IsUUID('4', { message: 'Venue ID must be a valid UUID' })
    venueId!: string;
  }
  