import {Employee} from '../interface/employee';

class EmployeeOrg {
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
            console.warn('Not found supervisor with ID:', supervisorId)
            return;
        }

        supervisor.subordinates.push(newEmployee);
    }

    move(employeeId: number, supervisorId: number) {
        const employee = this.find(employeeId)
        const newSupervisor = this.find(supervisorId);

        if (!newSupervisor) {
            console.warn('Not found supervisor with ID:', supervisorId)
            return;
        }
        if (!employee) {
            console.warn('Not found employee with ID:', employeeId)
            return;
        }
        if (!employee.supervisor) {
            console.warn('cannot move ceo: ', employeeId)
            return;
        }
        // execute move logic
        newSupervisor.subordinates.push(employee);
        this.actionStack.pushAction(
            {
                undo: {type: 'remove', subject: newSupervisor, item: employee},
                redo: {type: 'add', subject: newSupervisor, item: employee}
            }
        );
        const oldSupervisor = employee.supervisor;
        employee.supervisor = newSupervisor;
        this.actionStack.pushAction(
            {
                undo: {type: 'set', subject: employee, item: oldSupervisor},
                redo: {type: 'set', subject: employee, item: newSupervisor}
            }
        );
        oldSupervisor.subordinates.splice(
            // might need to improve this?
            oldSupervisor.subordinates.findIndex(e => e === employee),
            1,
        );
        this.actionStack.pushAction(
            {
                undo: {type: 'add', subject: oldSupervisor, item: employee},
                redo: {type: 'remove', subject: oldSupervisor, item: employee}
            }
        )
        // remove all subordinates of employee
        const subordinates = employee.subordinates.splice(0);
        this.actionStack.pushAction(
            {
                undo: {type: 'return', subject: employee, item: subordinates},
                redo: {type: 'splice', subject: employee, item: subordinates}
            }
        );
        oldSupervisor.subordinates.concat(
            // concat those to oldSupervisor
            subordinates
        );
        this.actionStack.pushAction(
            {
                undo: {type: 'splice', subject: oldSupervisor, item: subordinates},
                redo: {type: 'return', subject: oldSupervisor, item: subordinates}
            }
        );
    }

    undoMove() {
        this.actionStack.undo();
    }

    redoMove() {
        this.actionStack.redo();
    }
}

type TraceAction = { item: Employee; subject: Employee; type: 'add' | 'remove' | 'set' } | {
    item: Employee[]
    type: 'splice' | 'return',
    subject: Employee
}
type Action = {
    undo: TraceAction;
    redo: TraceAction;
}

class StackTraceManager {
    actionUnDo: Action[] = []
    actionRedo: Action[] = []


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
        this.actionRedo = []
        this.actionUnDo.push(action)
    }

    private execAction(traceAction: TraceAction) {
        switch (traceAction.type) {
            case 'add':
                traceAction.subject.subordinates.push(traceAction.item)
                break;
            case 'set':
                traceAction.subject.supervisor = traceAction.item;
                break;
            case 'return':
                traceAction.subject.subordinates.concat(traceAction.item)
                break;
            case 'splice':
                traceAction.subject.subordinates.splice(
                    traceAction.subject.subordinates.findIndex(
                        e => e === traceAction.item[0]
                    ),
                    traceAction.item.length
                );
                break;
            case 'remove':
                traceAction.subject.subordinates.splice(
                    // might need to improve this?
                    traceAction.subject.subordinates.findIndex(e => e === traceAction.item),
                    1,
                );
                break;
            default:
                console.log('No action')
        }
    }
}
