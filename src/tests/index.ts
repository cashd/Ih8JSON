import Server from "../";

var serv = new Server("/");
serv.route.addMiddleware((req, res) =>
  console.log("At base route ready to go!")
);
const test = serv.mount("/test");
test.addMiddleware((req, res) => {});
test.get("/1", (req, res) => {
  console.log("here in the callback test/1");
  return { cash: "deleon" };
});
serv.run();
