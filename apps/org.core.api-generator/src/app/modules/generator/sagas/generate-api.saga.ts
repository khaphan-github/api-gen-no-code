import { Injectable } from "@nestjs/common";
import { ICommand, Saga, ofType } from "@nestjs/cqrs";
import { Observable, map } from "rxjs";
import { TaskGenerateAPIsCommand } from "../commands/create-apis-task.command";
import { GenerateApisEvent } from "../events/execute-sql-create-db.event";

@Injectable()
export class GenerateAPISagas {
  @Saga()
  executeSQLSCriptCreateDB = (events$: Observable<unknown>): Observable<ICommand> => {
    return events$.pipe(
      ofType(GenerateApisEvent),
      map((event) => {
        console.log(`Event bus work`);
        return new TaskGenerateAPIsCommand(
          event.workspaceConnections,
          event.ownerId,
          event.appId,
          event.tableInfo
        );
      }),
    );
  }
}