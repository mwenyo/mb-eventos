import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';

import Base from './base';
import EventEntity from './event';

@Entity('user')
export default class UserEntity extends Base {

  @OneToMany(() => EventEntity, event => event.promoter)
  events?: EventEntity[];

  @Column()
  public name?: string;

  @Column()
  public cpfCpnj?: string;

  @Column()
  public address?: string;

  @Column({ type: 'int4' })
  public profileType?: number;

  @Column()
  public email?: string;

  @Column()
  public password?: string;
}
