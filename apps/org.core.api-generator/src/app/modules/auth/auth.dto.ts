import { IsNotEmpty, IsString } from "class-validator";

export class UserLoginDTO {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
