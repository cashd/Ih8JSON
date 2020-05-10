import { createServer, RequestListener, ServerResponse } from "http";
import treeify, { TreeObject } from "treeify";
import { stringify } from "querystring";
import { url } from "inspector";
import { create } from "domain";

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
  children: Record<string, Route>;
  value: string;
  routerRef: Router;
  getHandler?: EventHandler;
  // path  must be single block
  constructor(path: string, routerRef: Router) {
    // this.children = new Set([]);
    this.children = {};
    this.value = path;
    this.routerRef = routerRef;
  }

  createPathChain(path: string): Array<String> {
    const length = path.length;
    // Check if path is empty string
    if (length < 1) {
      throw new Error("");
    }

    let actualPath = path;

    // Check for leading slash
    if (length > 1 && path.startsWith("/")) {
      actualPath = actualPath.slice(1);
    }

    // Check for following slash
    if (path.endsWith("/")) {
      actualPath = actualPath.slice(0, -1);
    }

    if (!actualPath) {
      throw new Error("");
    }

    return actualPath.split("/");
  }

  get(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  setGetHandler(func: EventHandler) {
    this.getHandler = func;
  }

  // Mounts a get request at the path
  // get() {

  // }
}

const routeMaker = (
  path: Array<string>,
  routerRef: Router,
  eventHandlerType?: EventHandlerType,
  handler?: EventHandler
): Route => {
  // const helper = (block: string, parent?: Route) => {
  //   // const nextSlash = block.indexOf("/");
  //   // const urlBlock = block.substr(0, nextSlash);
  //   // var newr = new Route(block);
  //   // if (nextSlash === -1) {
  //   //   // add handler function to right set
  //   //   return newr;
  //   // }
  //   // newr.children.add(helper(urlBlock.substr(nextSlash), newr));
  //   // return newr;

  // };
  const length = path.length;
  var base = new Route(path[0], routerRef);
  var parent = base;
  path.slice(1).forEach((elem, i) => {
    var newRoute = new Route(elem, routerRef);
    if (i === length - 1 && handler) {
      eventHandlerType === "get" && newRoute.setGetHandler(handler);
    }
    parent.children[elem] = newRoute;
    parent = newRoute;
  });
  return base;
};

function createPathChain(path: string): Array<string> {
  const length = path.length;
  // Check if path is empty string
  if (length < 1) {
    throw new Error("");
  }

  let actualPath = path;

  // Check for leading slash
  if (length > 1 && path.startsWith("/")) {
    actualPath = actualPath.slice(1);
  }

  // Check for following slash
  if (path.endsWith("/")) {
    actualPath = actualPath.slice(0, -1);
  }

  if (!actualPath) {
    throw new Error("");
  }

  return actualPath.split("/");
}

class Server {
  router: Router;
  constructor(path: string = "/") {
    this.router = new Router(path);
  }

  // Base Mount from root path
  mount(path: string, middleware?: Array<Function>): Route {
    // // add children routes to parent rount
    return this.router.mount(path);
  }

  mountBaseRoute() {}

  printRoutes() {
    this.router.print();
  }
}

interface MountInstructions {
  startIndex: number;
  node: Route;
  sameEnd: boolean;
}

class Router {
  routes: Set<Route>;
  baseRoute: Route;
  constructor(basePath: string = "/") {
    this.baseRoute = new Route("/", this);
    this.routes = new Set<Route>([]);
    this.routes.add(this.baseRoute);
  }

  // Assumes valid path chain
  add(path: Array<string>) {
    //
  }

  findMountableNode(
    pathChain: Array<string>,
    mountTo?: Route
  ): MountInstructions {
    const helper = (index: number, route: Route): MountInstructions => {
      if (index === pathChain.length - 1) {
        if (!(pathChain[index] in route.children)) {
          return {
            startIndex: pathChain.length - 1,
            node: route,
            sameEnd: false,
          };
        }
        return { startIndex: pathChain.length - 1, node: route, sameEnd: true };
      }
      if (!(pathChain[index] in route.children)) {
        return { startIndex: index, node: route, sameEnd: false };
      }
      return helper(index + 1, route.children[pathChain[index]]);
    };
    const result = helper(0, mountTo || this.baseRoute);
    return result;
  }

  findMountBase(path: string) {}

  addNewRouteToSet(route: Route) {
    route && this.routes.add(route);
    const child = Object.values(route.children)[0];
    child && this.addNewRouteToSet(child);
  }

  mount(path: string, mountTo?: Route): Route {
    const pathChain = createPathChain(path);
    const instr = this.findMountableNode(pathChain);
    if (instr.sameEnd) {
      throw Error("Cannot mount duplicate url path!");
    }
    var route = routeMaker(pathChain.slice(instr.startIndex), this);
    // add all routes on chain to routes set
    this.addNewRouteToSet(route);
    //this.routes.add(route);
    instr.node.children[pathChain.slice(instr.startIndex)[0]] = route;
    //this.baseRoute.children.add(route);
    return route;
  }

  print() {
    //console.log(this.baseRoute);
    console.log(
      treeify.asTree((this.baseRoute as unknown) as TreeObject, true, false)
    );
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
// console.log("starting...");
// var serv = new Server("/");
// var userPath = serv.mount("user");
// userPath.get("settings", () => console.log("In settings handler"));
// // serv.printRoutes();
// console.log(serv.router.baseRoute.children);

var serv = new Server("/");
var userRoutes = serv.mount("/users/epic/");
var newRoute = serv.mount("/users/new/");
var duproute = serv.mount("/users/new");

console.log("!!");
