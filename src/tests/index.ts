import Server from "../";

var serv = new Server("/");
var userRoutes = serv.mount("/users/");
var newRoute = serv.mount("/users/new/");
userRoutes.get("/settings/", () => console.log("In the settings route!"));
userRoutes.get("/<profile>/view", () => console.log("in route w dynamic name"));
serv.printRoutes();
serv.printRoutes();
