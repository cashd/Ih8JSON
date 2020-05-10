import { createServer, RequestListener, ServerResponse } from "http";
import treeify, { TreeObject } from "treeify";

interface Response {}

interface Request {}

interface MountInstructions {
  startIndex: number;
  node: Route;
  sameEnd: boolean;
}

type EventHandler = (req: Request, res: Response) => Response | void;
type EventHandlerType =
  | "get"
  | "post"
  | "put"
  | "head"
  | "delete"
  | "patch"
  | "options";
type HTTPMethod = EventHandlerType;

function routeMaker(
  path: Array<string>,
  routerRef: Router,
  eventHandlerType?: EventHandlerType,
  handler?: EventHandler
): Route {
  const length = path.length;
  var base = new Route(path[0], routerRef);
  var parent = base;
  path.slice(1).forEach((elem, i) => {
    var newRoute = new Route(elem, routerRef);
    if (i === length - 1 && handler) {
      eventHandlerType &&
        handler &&
        newRoute.setHTTPMethodEventHandler(eventHandlerType, handler);
    }
    parent.children[elem] = newRoute;
    parent = newRoute;
  });
  return base;
}

function createPathChain(path: string): Array<string> {
  const length = path.length;
  // Check if path is empty string
  if (length < 1) {
    throw new Error("");
  }

  let actualPath = path;
  if (length > 1 && path.startsWith("/")) {
    actualPath = actualPath.slice(1);
  }

  if (path.endsWith("/")) {
    actualPath = actualPath.slice(0, -1);
  }

  if (!actualPath) {
    throw new Error("");
  }

  return actualPath.split("/");
}

class Route {
  children: Record<string, Route>;
  value: string;
  routerRef: Router;
  private getHandler?: EventHandler;
  private postHandler?: EventHandler;
  private putHandler?: EventHandler;
  private headHandler?: EventHandler;
  private deleteHandler?: EventHandler;
  private patchHandler?: EventHandler;
  private optionsHandler?: EventHandler;
  constructor(path: string, routerRef: Router) {
    this.children = {};
    this.value = path;
    this.routerRef = routerRef;
  }

  get(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  post(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  put(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  head(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  delete(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  patch(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  options(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this);
  }

  setHTTPMethodEventHandler(method: HTTPMethod, func: EventHandler) {
    switch (method) {
      case "get":
        this.getHandler = func;
        break;
      case "post":
        this.postHandler = func;
        break;
      case "put":
        this.putHandler = func;
        break;
      case "head":
        this.headHandler = func;
        break;
      case "delete":
        this.deleteHandler = func;
        break;
      case "patch":
        this.patchHandler = func;
        break;
      case "options":
        this.optionsHandler = func;
        break;
    }
  }
}

class Server {
  router: Router;
  constructor(path: string = "/") {
    this.router = new Router(path);
  }

  mount(path: string, middleware?: Array<Function>): Route {
    return this.router.mount(path);
  }

  printRoutes() {
    this.router.print();
  }
}

class Router {
  routes: Set<Route>;
  baseRoute: Route;
  constructor(basePath: string = "/") {
    this.baseRoute = new Route("/", this);
    this.routes = new Set<Route>([]);
    this.routes.add(this.baseRoute);
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
    this.addNewRouteToSet(route);
    if (mountTo) {
      mountTo.children[pathChain.slice(instr.startIndex)[0]] = route;
    } else {
      instr.node.children[pathChain.slice(instr.startIndex)[0]] = route;
    }
    return route;
  }

  getRoute(url: string) {}

  print() {
    console.log(
      treeify.asTree((this.baseRoute as unknown) as TreeObject, true, false)
    );
  }
}

var serv = new Server("/");
var userRoutes = serv.mount("/users/");
var newRoute = serv.mount("/users/new/");
userRoutes.get("/settings/", () => console.log("In the settings route!"));
serv.printRoutes();
