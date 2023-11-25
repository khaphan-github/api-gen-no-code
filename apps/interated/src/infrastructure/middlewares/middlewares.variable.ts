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
