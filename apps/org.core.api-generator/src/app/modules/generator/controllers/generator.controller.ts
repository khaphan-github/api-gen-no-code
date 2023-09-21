import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Api Generator')
@Controller('generator')
export class GeneratorController {
}
