import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class CustomizeInputMiddleware implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // TODO: Biến đỗi dữ liệu người dùng truyền vào thành kiểu nó quy định123
    console.log('CustomizeInputMiddleware executed.');
    return next.handle();
  }
}
