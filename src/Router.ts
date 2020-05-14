import Route, { EventHandler, EventHandlerType } from "./Route";
import treeify, { TreeObject } from "treeify";
import { createPathChain, routeMaker } from "./utils";
import { IncomingMessage, ServerResponse } from "http";

interface MountInstructions {
  startIndex: number;
  node: Route;
  sameEnd: boolean;
}

export interface RequestPayload {
  request: IncomingMessage;
  response: ServerResponse;
  params: Record<string, any>;
  store: Record<string, any>;
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

  mount(
    path: string,
    mountTo?: Route,
    handlerType?: EventHandlerType,
    handler?: EventHandler
  ): Route {
    const pathChain = createPathChain(path);
    const instr = this.findMountableNode(pathChain, mountTo);
    if (instr.sameEnd) {
      throw Error("Cannot mount duplicate url path!");
    }
    const newPathChain = pathChain.slice(instr.startIndex);
    var route = routeMaker(newPathChain, this, handlerType, handler);
    this.addNewRouteToSet(route);
    const base: Route = mountTo || instr.node;
    base.children[newPathChain[0]] = route;
    route.isDynamic && base.setDynamicChild(route);
    return route;
  }

  // Starts the routing process and returns the final route
  start(path: string, payload: RequestPayload): Route {
    const pathSteps = createPathChain(path);
    const { store, request, response } = payload;
    let currentRoute = this.baseRoute;
    pathSteps.forEach((step) => {
      currentRoute.middleware.forEach((mw) => {
        mw(request, response, store);
      });
      if (!(step in currentRoute.children)) {
        if (!!currentRoute.dynamicChild) {
          currentRoute = currentRoute.dynamicChild;
        } else {
          console.error("invalid http path request header", request);
        }
      } else {
        currentRoute = currentRoute.children[step];
      }
    });
    return currentRoute;
  }

  print() {
    console.log(
      treeify.asTree((this.baseRoute as unknown) as TreeObject, true, false)
    );
  }
}

export default Router;
