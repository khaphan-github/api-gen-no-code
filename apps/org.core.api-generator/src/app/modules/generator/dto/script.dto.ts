import { IsNotEmpty } from "class-validator";

export class ExecuteScriptDto {
  @IsNotEmpty()
  script: string;

}