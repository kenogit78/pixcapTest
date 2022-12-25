interface IEmployee {
    uniqueId: number;
    name: string;
    subordinates: IEmployee[];
    supervisorId: number;
  }
  
  const employeeNameLists = [
    "Sarah Donald",
    "Tyler Simpson",
    "Bruce Willis",
    "Georgina Flangy",
    "Cassandra Reynolds",
    "Mary Blue",
    "Tina Teff",
    "Will Turner",
    "Harry Tobs",
    "Thomas Brown",
    "George Carrey",
    "Gary Styles",
    "Sophie Turner",
    "Bob Saget",
  ];
  
  interface IEmployeeTree {
    id?: IEmployee[];
  }
  
  interface ISubordinateTree {
    supervisorName: string;
    subordinates: string[];
  }
  
  const employeeSubordinateTree: ISubordinateTree[] = [
    {
      supervisorName: "Mark Zuckerberg",
      subordinates: [
        "Sarah Donald",
        "Tyler Simpson",
        "Bruce Willis",
        "Georgina Flangy",
      ],
    },
    {
      supervisorName: "Sarah Donald",
      subordinates: ["Cassandra Reynolds"],
    },
    {
      supervisorName: "Tyler Simpson",
      subordinates: ["Harry Tobs", "George Carrey", "Gary Styles"],
    },
    {
      supervisorName: "Georgina Flangy",
      subordinates: ["Sophie Turner"],
    },
    {
      supervisorName: "Cassandra Reynolds",
      subordinates: ["Mary Blue", "Bob Saget"],
    },
    {
      supervisorName: "Harry Tobs",
      subordinates: ["Thomas Brown"],
    },
    {
      supervisorName: "Bob Saget",
      subordinates: ["Tina Teff"],
    },
    {
      supervisorName: "Tina Teff",
      subordinates: ["Will Turner"],
    },
  ];
  
  interface IEmployeeOrgApp {
    ceo: Employee;
    /**
      * Moves the employee with employeeID (uniqueId) under a supervisor
      (another employee) that has supervisorID (uniqueId).
      * E.g. move Bob (employeeID) to be subordinate of Georgina (supervisorID). * @param employeeID
      * @param supervisorID
      */
    move(employeeID: number, supervisorID: number): void;
    /** Undo last move action */
    undo(): void;
    /** Redo last undone action */
    redo(): void;
  }
  
  class Employee implements IEmployee {
    uniqueId: number;
    name: string;
    subordinates: IEmployee[] = [];
    supervisorId: number = null;
    private static lastId: number = 0;
  
    constructor(name: string) {
      this.name = name;
      Employee.lastId += 1;
      this.uniqueId = Employee.lastId;
    }
  }
  
  class EmployeeOrgApp implements IEmployeeOrgApp {
    ceo: IEmployee;
    private employees: IEmployeeTree = {};
    private redoActions: string[] = [];
    private undoActions: string[] = [];
  
    constructor(ceo: IEmployee) {
      this.ceo = ceo;
      // set up example organogram given
      this.employees = { [ceo.uniqueId]: ceo };
      this.setup();
    }
  
    private addEmployee(name: string): void {
      const newEmployee = new Employee(name);
      if (!this.employees.hasOwnProperty(newEmployee.uniqueId)) {
        this.employees[newEmployee.uniqueId] = newEmployee;
      }
    }
  
    private findEmployee(param: number | string): IEmployee | null {
      if (typeof param === "number") return this.employees[param];
      if (this.ceo.name === param) return this.ceo;
      const employees = Object.values(this.employees) as IEmployee[];
      return employees.find((employee) => employee.name === param);
    }
  
    private setupSubordinates(): void {
      employeeSubordinateTree.forEach((obj) => {
        const supervisor = this.findEmployee(obj.supervisorName);
        if (supervisor) {
          const subordinates = obj.subordinates;
          subordinates.forEach((subordinate) => {
            const employee = this.findEmployee(subordinate);
            if (employee) {
              supervisor.subordinates.push(employee);
              employee.supervisorId = supervisor.uniqueId;
            }
          });
        }
      });
    }
  
    private setup(): void {
      employeeNameLists.forEach((name) => {
        this.addEmployee(name);
      });
      this.setupSubordinates();
    }
  
    move(employeeID: number, supervisorID: number): void {
      if (employeeID === supervisorID || this.ceo.uniqueId === employeeID) {
        return;
      }
      const employee = this.findEmployee(employeeID);
      const supervisor = this.findEmployee(supervisorID);
      if (employee && supervisor) {
        const previousEmployeeSupervisor = this.findEmployee(
          employee.supervisorId
        );
        const proviousEmployeeSubordinates = employee.subordinates;
        supervisor.subordinates.push(employee);
        employee.supervisorId = supervisor.uniqueId;
        employee.subordinates = [] as IEmployee[];
        previousEmployeeSupervisor.subordinates.push(
          ...proviousEmployeeSubordinates
        );
        proviousEmployeeSubordinates.forEach((prevSubordinate) => {
          prevSubordinate.supervisorId = previousEmployeeSupervisor.uniqueId;
        });
        // update undo actions state here to have last move action
        this.undoActions.push(
          `${previousEmployeeSupervisor.uniqueId}-${employeeID}-${supervisorID}`
        );
        // clear the redo last actions stack
        this.redoActions = [];
      }
    }
  
    undo(): void {
      if (this.undoActions.length) {
        this.redoActions = this.undoActions.pop().split("-");
        this.move(+this.redoActions[1], +this.redoActions[0]);
      }
    }
  
    redo(): void {
      if (this.redoActions.length) {
        this.move(+this.redoActions[1], +this.redoActions[2]);
      }
    }
  }
  
  const ceo = new Employee("Mark Zuckerberg");
  const app = new EmployeeOrgApp(ceo);
  
  console.log(app);
  console.log("================================================");
  app.move(5, 6);
  console.log(app);
  console.log("################################================");
  app.undo();
  console.log(app);
  console.log("**************************************************");
  app.redo();
  console.log(app);
  