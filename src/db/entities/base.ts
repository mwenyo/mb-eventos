import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

@Entity('base')
export default class Base {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column()
  createdBy?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt?: Date | string;

  @Column()
  updatedBy?: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt?: Date | string;

  @Column()
  deletedBy?: string;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | string;
}
