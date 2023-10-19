import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { SignUpDto } from '../auth/dto/sign-up.dto';

type NullablePartial<S, T> = T extends keyof S ? { [K in T]: S[K] } : never;

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(credentials: SignUpDto) {
    const user = this.repo.create(credentials);
    return this.repo.save(user);
  }

  findOne(attrs: NullablePartial<User, 'id' | 'email'>): Promise<User> {
    return this.repo.findOneBy({ ...attrs });
  }

  find(): Promise<User[]> {
    return this.repo.find();
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.repo.findOneBy({ id });

    if (!user) {
      throw new Error('User not found.');
    }

    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.repo.findOneBy({ id });

    if (!user) {
      throw new Error('User not found.');
    }

    return this.repo.remove(user);
  }
}
