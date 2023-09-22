import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JsonIoService {
  private readonly assetsPath = path.join(__dirname, 'assets');

  readJsonFile(fileName: string): object {
    const filePath = path.join(this.assetsPath, fileName);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }

  writeJsonFile(fileName: string, data: object): void {
    const filePath = path.join(this.assetsPath, fileName);
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf8');
  }
}
