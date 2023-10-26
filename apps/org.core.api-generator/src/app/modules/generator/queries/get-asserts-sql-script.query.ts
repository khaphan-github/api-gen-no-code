import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import NodeCache from 'node-cache';
import { FileReaderService } from '../../shared/file-reader.service';
import { ErrorStatusCode } from '../../../infrastructure/format/status-code';
import { AppCoreDomain } from '../../../domain/pgsql/pg.app.core.domain';

// #region error
export class SQLScripFileNotFoundError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor() {
    super(`SQL script not found - you should create file 'database.sql' in assets folder`);
    this.name = SQLScripFileNotFoundError.name;
    this.statusCode = 604;
  }
}
// #endregion error

export class GetSQLScriptQuery { }

@QueryHandler(GetSQLScriptQuery)
export class GetSQLScriptQueryHandler
  implements IQueryHandler<GetSQLScriptQuery>
{
  private readonly appCoreDomain!: AppCoreDomain;
  constructor(
    private readonly fileReader: FileReaderService,
    private readonly nodeCache: NodeCache,
  ) {
    this.appCoreDomain = new AppCoreDomain();
  }

  execute(): Promise<string> {
    const fileName = this.appCoreDomain.getSQLScriptFilename();

    const sqlScriptCache = this.nodeCache.get<string>(fileName);
    if (sqlScriptCache) {
      return Promise.resolve(sqlScriptCache);
    }

    let sqlScript = '';
    try {
      sqlScript =
        this.fileReader.readFileStringByFileName(fileName);
      this.nodeCache.set(fileName, sqlScript);
      return Promise.resolve(sqlScript);
    } catch (error) {
      return Promise.reject(new SQLScripFileNotFoundError());
    }
  }
}
