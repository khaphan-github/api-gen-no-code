import { IsNotEmpty, IsString } from "class-validator";

export class ConnectToServerDTO {
  @IsNotEmpty()
  @IsString()
  secretKey: string;
}
