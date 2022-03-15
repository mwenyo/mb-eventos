import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Base from './base';
import EventEntity from './event';
import UserEntity from './user';

@Entity('ticket')
export default class TicketEntity extends Base {
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'participantId' })
  public participant?: UserEntity;

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'eventId' })
  public event?: EventEntity;

  @Column()
  public code?: string;

  @Column()
  public status?: number;
}
