import { Employee } from "../interface/employee";

export type TraceAction =
  | { item: Employee; subject: Employee; type: "add" | "remove" | "set" }
  | {
      item: Employee[];
      type: "splice" | "return";
      subject: Employee;
    };
export type Action = {
  undo: TraceAction[];
  redo: TraceAction[];
};

export class StackTraceManager {
  actionUnDo: Action[] = [];
  actionRedo: Action[] = [];

  undo() {
    const action = this.actionUnDo.pop();
    if (!action) return;
    // exec action
    this.execAction(action.undo);
    this.actionRedo.push(action);
  }

  redo() {
    const action = this.actionRedo.pop();
    if (!action) return;
    // exec action
    this.execAction(action.redo);
    this.actionUnDo.push(action);
  }

  pushAction(action: Action) {
    this.actionRedo = [];
    this.actionUnDo.push(action);
  }

  private execAction(traceActions: TraceAction[]) {
    traceActions.forEach((traceAction) => {
      switch (traceAction.type) {
        case "add":
          traceAction.subject.subordinates.push(traceAction.item);
          break;
        case "set":
          traceAction.subject.supervisor = traceAction.item;
          break;
        case "return":
          traceAction.item.forEach((i) =>
            traceAction.subject.subordinates.push(i)
          );
          break;
        case "splice":
          traceAction.subject.subordinates.splice(
            traceAction.subject.subordinates.findIndex(
              (e) => e === traceAction.item[0]
            ),
            traceAction.item.length
          );
          break;
        case "remove":
          traceAction.subject.subordinates.splice(
            // might need to improve this?
            traceAction.subject.subordinates.findIndex(
              (e) => e === traceAction.item
            ),
            1
          );
          break;
        default:
          console.log("No action");
      }
    });
  }
}
