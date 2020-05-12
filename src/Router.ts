import Request from "./Request";
import Response from "./Response";

import Route, { EventHandler, EventHandlerType } from "./Route";
import treeify, { TreeObject } from "treeify";
import { createPathChain, routeMaker } from "./utils";

interface MountInstructions {
  startIndex: number;
  node: Route;
  sameEnd: boolean;
}

interface InheritancePayload {
  middleware?: Array<Middleware>;
  desiredEndware?: Array<EndWare>;
}

type Middleware = EventHandler;
type EndWare = () => void;

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

  // Agregates all variables that are suppose to be past down
  // * middleware
  // need to test if copy is needed
  // syncAllNewChildren(start: Route, parent: Route) {
  //   let middleware = parent.middleware.slice(0); // Copy
  //   const helper = (current: Route, par: Route) => {
  //     middleware = [...middleware, ...current.middleware];
  //     current.middleware = middleware.slice(0); // Copy
  //   };
  //   helper(start, parent);
  // }

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
    // Check if first new child is a dynamic
    route.isDynamic && base.setDynamicChild(route);
    // this.syncAllNewChildren(base, base.children[newPathChain[0]]);
    return route;
  }

  routeRequest(path: string, request: Request): Response {
    // make sure Request is a pointer to object
    const pathSteps = createPathChain(path);
    // Activate all mw function and carry reponse payload
    const response = new Response();
    let currentRoute = this.baseRoute;
    pathSteps.forEach((step) => {
      // Run all middleware
      currentRoute.middleware.forEach((mw) => {
        mw(request, response);
      });
      if (!(step in currentRoute.children)) {
        if (!!currentRoute.dynamicChild) {
          currentRoute = currentRoute.dynamicChild;
        } else {
          console.error("invalid http path request header", request);
          // return redirect response later to 404 not found
        }
      } else {
        currentRoute = currentRoute.children[step];
      }
    });
    // TODO Reached specific route object activate right handlers
    return response;
  }

  // Router Tree Navigation
  route(start: Route) {}

  getRoute(url: string) {}

  print() {
    console.log(
      treeify.asTree((this.baseRoute as unknown) as TreeObject, true, false)
    );
  }
}

export default Router;
