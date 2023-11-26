import { ErrorStatusCode } from "../../../infrastructure/format/status-code";

export class WrongUsernameOrPasswordError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor() {
    super(`Username and password were wrong`);
    this.name = WrongUsernameOrPasswordError.name;
    this.statusCode = 401;
  }
}


export class AccountIsLockedError extends Error implements ErrorStatusCode {
  statusCode: number;
  constructor() {
    super(`Account was locked`);
    this.name = WrongUsernameOrPasswordError.name;
    this.statusCode = 401;
  }
}
