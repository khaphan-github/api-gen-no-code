import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class AuthenticateMiddleware implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // TODO: Check this api with role public - don't need to auth.
    // TODO: Validate JWT TOKEN.

    console.log(`AuthenticateMiddleware`);
    // Your middleware logic goes here
    return next.handle();
  }
}
