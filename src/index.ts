import { Employee } from "./interface/employee";
import { EmployeeOrg } from "./app/employee-org";

const ceo: Employee = {
  uniqueId: 1,
  name: "Mark Zuckerberg",
  subordinates: [],
};

const app = new EmployeeOrg(ceo);

app.add({ uniqueId: 2, name: "Sarah Donald", subordinates: [] }, 1);
app.add({ uniqueId: 3, name: "Tyler Simpson", subordinates: [] }, 1);
app.add({ uniqueId: 4, name: "Bruce Willis", subordinates: [] }, 1);
app.add({ uniqueId: 5, name: "Georgina Flangy", subordinates: [] }, 1);
app.add({ uniqueId: 6, name: "Cassandra Reynolds", subordinates: [] }, 2);
app.add({ uniqueId: 7, name: "Harry Tobs", subordinates: [] }, 3);
app.add({ uniqueId: 8, name: "George Carrey", subordinates: [] }, 3);
app.add({ uniqueId: 9, name: "Gary Styles", subordinates: [] }, 3);
app.add({ uniqueId: 10, name: "Sophie Turner", subordinates: [] }, 5);
app.add({ uniqueId: 11, name: "Mary Blue", subordinates: [] }, 6);
app.add({ uniqueId: 12, name: "Bob Saget", subordinates: [] }, 6);
app.add({ uniqueId: 13, name: "Thomas Brown", subordinates: [] }, 7);
app.add({ uniqueId: 14, name: "Tina Teff", subordinates: [] }, 12);
app.add({ uniqueId: 15, name: "Will Turner", subordinates: [] }, 14);

app.display();

app.move(12, 5);
console.log("==================");
app.display();
console.log("==================");
app.undoMove();
app.display();
console.log("==================");
app.redoMove();
app.display();
