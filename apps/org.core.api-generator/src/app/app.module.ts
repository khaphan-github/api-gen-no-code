import { Module } from '@nestjs/common';

import { CrudModule } from './modules/crud-pg/crud.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { ConfigModule } from '@nestjs/config';
import { JsonIoService } from './modules/shared/json.io.service';
import { FileReaderService } from './modules/shared/file-reader.service';
import { GenerateModule } from '@org.api-generator/generate';

const FEATUREMODULES = [
  CrudModule,
  GeneratorModule,
]

@Module({
  imports: [
    ...FEATUREMODULES,
    GenerateModule,
    ConfigModule.forRoot(),
  ],
  providers: [
    JsonIoService,
    FileReaderService,
  ]
})
export class AppModule { }
