import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private users = [
    { id: 1, username: 'Tom', age: 20 },
    { id: 2, username: 'Jack', age: 22 },
  ];

  create(dto: CreateUserDto) {
    const user = {
      id: this.users.length + 1,
      ...dto,
    };
    this.users.push(user);
    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    console.log('🚀日志===== findOne', id);

    const item = this.users.find((item) => item.id === id);
    if (!item) {
      throw new Error(`User with ID ${id} not found`);
    }
    return item;
  }
}
