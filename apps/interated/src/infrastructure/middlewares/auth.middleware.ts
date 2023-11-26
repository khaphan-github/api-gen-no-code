import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { API_WHITE_LIST } from './middlewares.variable';
import { ManageApiService } from 'apps/org.core.api-generator/src/app/modules/manage/services/manage-api.service';
@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  constructor(
    private readonly mangageApiService: ManageApiService,
  ) { }

  use(req: Request, res: Response, next: NextFunction) {
    if (_.includes(API_WHITE_LIST, req.baseUrl)) {
      console.log(`Exec api in white list`);
      return next();
    }

    // Case request with secret key.
    const secretKey = req.header('X-Secretkey');
    if (secretKey && secretKey?.length !== 0) {
      if (!this.mangageApiService.isValidSecetKey(secretKey)) {
        throw new HttpException({
          'message': 'Secretkey invalid, please auth to exec this api',
          'action': 'Auth with config mode'
        }, 401)
      }
      return next();
    }

    // Case login by usabse mode
    // TODO: Check is call request with config mode:
    const authToken = req.header('Authenticate');
    // Validate access token;


    console.log(`Logger Middleware: Secret Key - ${secretKey}, Auth Token - ${secretKey}`);

    return next();
  }
}
