import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Base from './base';
import UserEntity from './user';

@Entity('event')
export default class EventEntity extends Base {
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'promoterId' })
  public promoter?: UserEntity;

  @Column()
  public name?: string;

  @Column()
  public tickets?: number;

  @Column()
  public address?: string;

  @Column()
  public date?: Date;

  @Column()
  public limitByParticipant?: boolean;
}
