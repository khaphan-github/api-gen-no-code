import { Module } from '@nestjs/common';

import { CrudModule } from './modules/crud/crud.module';
import { GeneratorModule } from './modules/generator/generator.module';

@Module({
  imports: [
    CrudModule,
    GeneratorModule
  ],
})
export class AppModule { }
