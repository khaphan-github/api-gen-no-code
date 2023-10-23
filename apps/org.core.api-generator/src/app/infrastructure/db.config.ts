import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const TypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    type: configService.get<string>('app.database.type') as any,
    host: configService.get<string>('app.database.host', 'localhost'),
    port: configService.get<number>('app.database.port', 5432),
    username: configService.get<string>('app.database.username', 'database'),
    password: configService.get<string>('app.database.password', 'database'),
    database: configService.get<string>(
      'app.database.databaseName',
      'database',
    ),
    autoLoadEntities: false,
    synchronize: true,
    entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  };
};
