import { Module } from '@nestjs/common';

import { CrudModule } from './modules/crud-pg/crud.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppEnvironmentConfig } from './infrastructure/env/app.env.config';
import { TypeOrmPostgresConfig } from './infrastructure/postgres.db.config';

const FEATUREMODULES = [
  CrudModule,
  GeneratorModule,
]

@Module({
  imports: [
    ...FEATUREMODULES,
    ConfigModule.forRoot({
      load: [AppEnvironmentConfig],
      isGlobal: true,
    }),

    // Infrastructure config
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: TypeOrmPostgresConfig,
    }),

  ],
  providers: []
})
export class AppModule { }
