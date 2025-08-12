import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() companyName: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.registerCompanyOwner(dto.email, dto.password, dto.companyName); }
}
