export enum MiddlewaresVarible {
  UserMetadata = 'userMetadata',
  IsPassAll = 'isPassAll',
}

export class UserMetadata {
  userId: string;
  permissionId: string;
  permissionName: string;
  iat: number;
  exp: number;
}


export const API_WHITE_LIST = [
  '/api/v1/connect',
  '/api/v1/login',
  '/api/v1/register',
]
