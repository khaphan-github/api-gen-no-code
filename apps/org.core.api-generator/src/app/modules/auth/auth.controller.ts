/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post } from '@nestjs/common';
import { UserLoginDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { ResponseBase } from '../../infrastructure/format/response.base';

@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) { }
  @Post(`login`)
  login(@Body() userLoginDto: UserLoginDTO) {
    try {
      const loginResult = this.service.login(userLoginDto);
      return new ResponseBase(200, `Login successs`, loginResult);
    } catch (error) {
      return new ResponseBase(401, `Login failure`, error);
    }
  }

  @Post(`register`)
  register() {
    //
  }
}
