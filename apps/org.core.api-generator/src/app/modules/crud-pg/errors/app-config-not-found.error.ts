import { ErrorStatusCode } from "../../../infrastructure/format/status-code";

export class AppConfigNotFoundError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor(appId: string | number) {
    super(`Application config in in ${appId} not found`);
    this.name = AppConfigNotFoundError.name;
    this.statusCode = 600;
  }
}