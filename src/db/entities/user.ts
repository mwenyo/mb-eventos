import {
  Entity,
  Column,
} from 'typeorm';

import Base from './base';

@Entity('user')
export default class UserEntity extends Base {
  @Column()
  public name?: string;

  @Column()
  public cpfCpnj?: string;

  @Column()
  public adress?: string;

  @Column({ type: 'int4' })
  public profileType?: number;

  @Column()
  public email?: string;

  @Column()
  public password?: string;
}
