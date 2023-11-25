import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class AuthorizationMiddleware implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // TODO: Chêck logic if they have token - check in table role user and role,
    // Lấy tất cả quyền của user (Cache đống này) , Kiểm tra user có vào được api đó không?
    // Nếu có thì next còn không thì không next,
    console.log('AuthorizationMiddleware executed.');
    return next.handle();
  }
}
