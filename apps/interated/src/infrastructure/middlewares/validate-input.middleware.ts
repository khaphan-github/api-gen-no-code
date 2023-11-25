import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class ValidateInputMiddleware implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // TODO: Check logic vlidate appkey
    // Gọi thông tin của mấy bảng trong db để check input có hợp lệ hay không
    console.log('ValidateInputMiddleware executed.');
    return next.handle();
  }
}
