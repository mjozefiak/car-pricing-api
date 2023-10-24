import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterInsert,
  AfterRemove,
  OneToMany,
} from 'typeorm';
import { Report } from '../report/report.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with ID: ' + this.id);
  }

  @AfterRemove()
  logUpdate() {
    console.log('Updated user with ID: ' + this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed user with ID: ' + this.id);
  }
}
