import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterInsert,
  AfterRemove,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

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
