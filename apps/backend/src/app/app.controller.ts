import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { LoginDto, UserDto } from '@fullstarck/api-contracts'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData()
  }

  @Post('auth/login')
  login(@Body() loginDto: LoginDto): UserDto {
    // This is a mock implementation
    return {
      id: '1',
      email: loginDto.email,
      name: 'John Doe',
      createdAt: new Date(),
    }
  }
}
