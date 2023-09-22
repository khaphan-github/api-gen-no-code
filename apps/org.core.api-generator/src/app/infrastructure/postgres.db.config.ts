import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const TypeOrmPostgresConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: configService.get<string>('app.postgres.host', 'localhost'),
    port: configService.get<number>('app.postgres.port', 5432),
    username: configService.get<string>('app.postgres.username', 'postgres'),
    password: configService.get<string>('app.postgres.password', 'postgres'),
    database: configService.get<string>(
      'app.postgres.databaseName',
      'postgres',
    ),
    autoLoadEntities: false,
    synchronize: true,
    entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  
  };
};
