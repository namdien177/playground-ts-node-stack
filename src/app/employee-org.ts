import { Employee } from "../interface/employee";
import { Action, StackTraceManager } from "./stack-trace-manager";

export class EmployeeOrg {
  private ceo: Employee;
  private actionStack = new StackTraceManager();

  constructor(ceo: Employee) {
    this.ceo = ceo;
  }

  find(id: number, currentEmployee = this.ceo): Employee | null {
    if (currentEmployee.uniqueId === id) {
      return currentEmployee;
    }

    for (const employee of currentEmployee.subordinates) {
      const findEmployee = this.find(id, employee);
      if (findEmployee) {
        return findEmployee;
      }
    }

    return null;
  }

  add(newEmployee: Employee, supervisorId: number) {
    const supervisor = this.find(supervisorId);

    if (supervisor === null) {
      console.warn("Not found supervisor with ID:", supervisorId);
      return;
    }

    newEmployee.supervisor = supervisor;

    supervisor.subordinates.push(newEmployee);
  }

  move(employeeId: number, supervisorId: number) {
    const employee = this.find(employeeId);
    const newSupervisor = this.find(supervisorId);

    if (!newSupervisor) {
      console.warn("Not found supervisor with ID:", supervisorId);
      return;
    }
    if (!employee) {
      console.warn("Not found employee with ID:", employeeId);
      return;
    }
    if (!employee.supervisor) {
      console.warn("cannot move ceo: ", employeeId);
      return;
    }
    const traceActions: Action = {
      undo: [],
      redo: [],
    };

    // execute move logic
    newSupervisor.subordinates.push(employee);
    traceActions.undo.push({
      type: "remove",
      subject: newSupervisor,
      item: employee,
    });
    traceActions.redo.push({
      type: "add",
      subject: newSupervisor,
      item: employee,
    });
    const oldSupervisor = employee.supervisor;
    employee.supervisor = newSupervisor;
    traceActions.undo.push({
      type: "set",
      subject: employee,
      item: oldSupervisor,
    });
    traceActions.redo.push({
      type: "set",
      subject: employee,
      item: newSupervisor,
    });
    oldSupervisor.subordinates.splice(
      oldSupervisor.subordinates.findIndex((e) => e === employee), // might need to improve this?
      1
    );
    traceActions.undo.push({
      type: "add",
      subject: oldSupervisor,
      item: employee,
    });
    traceActions.redo.push({
      type: "remove",
      subject: oldSupervisor,
      item: employee,
    });
    // remove all subordinates of employee
    const subordinates = employee.subordinates.splice(0);
    traceActions.undo.push({
      type: "return",
      subject: employee,
      item: subordinates,
    });
    traceActions.redo.push({
      type: "splice",
      subject: employee,
      item: subordinates,
    });
    subordinates.forEach((subordinate) =>
      oldSupervisor.subordinates.push(
        // concat those to oldSupervisor
        subordinate
      )
    );

    traceActions.undo.push({
      type: "splice",
      subject: oldSupervisor,
      item: subordinates,
    });
    traceActions.redo.push({
      type: "return",
      subject: oldSupervisor,
      item: subordinates,
    });
    this.actionStack.pushAction(traceActions);
  }

  undoMove() {
    this.actionStack.undo();
  }

  redoMove() {
    this.actionStack.redo();
  }

  display(step = 1, employee: Employee = this.ceo) {
    const padding = Array(step - 1)
      .fill("  ")
      .join("");
    console.log(`${padding}-${employee.name}`);
    employee.subordinates.forEach((subordinate) =>
      this.display(step + 1, subordinate)
    );
  }
}
