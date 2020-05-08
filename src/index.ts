import { createServer, RequestListener, ServerResponse } from "http";
import treeify, { TreeObject } from "treeify";
import { stringify } from "querystring";
import { url } from "inspector";

// interface Route {
//   value: string;
//   children: Set<Route>;
//   get?: () => any;
//   post?: () => any;
// }

interface Response {}

interface Request {}

type EventHandler = (req: Request, res: Response) => Response | void;
type EventHandlerType = "get" | "post";

class Route {
  children: Set<Route>;
  path: string;
  getHandler?: EventHandler;
  // path  must be single block
  constructor(path: string) {
    this.children = new Set([]);
    this.path = path;
  }

  get(path: string, handler: EventHandler) {
    this.children.add(routeMaker(path, "get", handler));
  }

  setGetHandler(func: EventHandler) {
    this.getHandler = func;
  }

  // Mounts a get request at the path
  // get() {

  // }
}

const routeMaker = (
  path: string,
  eventHandlerType?: EventHandlerType,
  handler?: EventHandler,
  parent?: Route
): Route => {
  const helper = (block: string, parent?: Route) => {
    const nextSlash = block.indexOf("/");
    const urlBlock = block.substr(0, nextSlash);
    var newr = new Route(block);
    if (nextSlash === -1) {
      // add handler function to right set
      return newr;
    }
    newr.children.add(helper(urlBlock.substr(nextSlash), newr));
    return newr;
  };
  return helper(path);
};

class Server {
  router: Router;
  constructor(path: string = "/") {
    this.router = new Router(path);
  }

  // Base Mount from root path
  mount(path: string, middleware?: Array<Function>): Route {
    // add children routes to parent rount
    var route = routeMaker(path);
    return this.router.mount(route);
  }

  mountBaseRoute() {}

  printRoutes() {
    this.router.print();
  }
}

class Router {
  routes: Set<Route>;
  baseRoute: Route;
  constructor(basePath: string = "/") {
    this.baseRoute = new Route("/");
    this.routes = new Set<Route>([]);
    this.routes.add(this.baseRoute);
  }

  mount(route: Route) {
    this.routes.add(route);
    this.baseRoute.children.add(route);
    console.log(
      "in router object printing current routes after add",
      this.routes
    );
    return route;
  }

  print() {
    //console.log(this.baseRoute);
    treeify.asTree((this.baseRoute as unknown) as TreeObject, true, false);
  }
}

// const handler = (req: RequestListener, res: ServerResponse) => {};

// const server = createServer();

// var router = new Router("/");
// router.add('cash', () => console.log('Cash Route.'));
// const userRoute = makeRoute('users/', () => console.log('User Route.'), [

// ])
// router.add('cash', () => console.log('Cash Route.'));

// var server  = new Server1()
// server.get('/settings', () => void)
// var userRoutes = server.mount('/user', middleware)
// userRoutes.get('/profile', profileHandler)
// userRoutes.get('/settings', settingHandler)
console.log("starting...");
var serv = new Server("/");
var userPath = serv.mount("user");
userPath.get("settings", () => console.log("In settings handler"));
// serv.printRoutes();
console.log(serv.router.baseRoute.children);
