import { Injectable } from "@nestjs/common";
import pg, { Client, ClientConfig } from 'pg';

@Injectable()
export class PostgresConnectorService {
  private pgConnection!: Client;

  async getPgSQLConnection() {
    return this.pgConnection;
  }

  setConfig(config: ClientConfig) {
    this.pgConnection = new pg.Client(config);
  }

  async execute(query: string, params?: unknown[]) {
    const client = await this.getPgSQLConnection();
    try {
      await client.connect();
      const queryResult = await client.query(query, params);
      return queryResult;
    } finally {
      client.end();
    }
  }
}
