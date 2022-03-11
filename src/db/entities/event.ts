import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';

import Base from './base';
import UserEntity from './user';

@Entity('event')
export default class EventEntity extends Base {
  @Column()
  public name?: string;

  @ManyToOne(() => UserEntity)
  public promoter?: UserEntity;

  @Column()
  public tickets?: number;

  @Column()
  public address?: string;

  @Column()
  public date?: Date;

  @Column()
  public limitByParticipant?: boolean;
}
