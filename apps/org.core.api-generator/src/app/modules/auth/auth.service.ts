/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { UserLoginDTO } from './auth.dto';

@Injectable()
export class AuthService {
  login(userLoginDto: UserLoginDTO) {

    return userLoginDto;
  }
}
