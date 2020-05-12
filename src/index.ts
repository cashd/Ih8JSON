// This is going to be the entrypoint for the project

// import {
//   createServer,
//   RequestListener,
//   ServerResponse,
//   IncomingMessage,
// } from "http";
// import treeify, { TreeObject } from "treeify";

// class Response {
//   payload: object;
//   params: object;
//   constructor() {
//     this.payload = {};
//     this.params = {};
//   }
// }

// class Request {
//   constructor() {}
// }

// interface MountInstructions {
//   startIndex: number;
//   node: Route;
//   sameEnd: boolean;
// }

// interface InheritancePayload {
//   middleware?: Array<Middleware>;
//   desiredEndware?: Array<EndWare>;
// }

// type EventHandler = (req: Request, res: Response) => Response | void;
// type EventHandlerType =
//   | "get"
//   | "post"
//   | "put"
//   | "head"
//   | "delete"
//   | "patch"
//   | "options";
// type HTTPMethod = EventHandlerType;
// type Middleware = EventHandler;
// type EndWare = () => void;

// function routeMaker(
//   path: Array<string>,
//   routerRef: Router,
//   eventHandlerType?: EventHandlerType,
//   handler?: EventHandler
// ): Route {
//   const length = path.length;
//   var base: Route | null = null;
//   var parent: Route | null = null;
//   path.forEach((elem, i) => {
//     // Do a regex check here instead later for dyanmic path
//     if (elem.includes("<") && elem.includes(">")) {
//       var newRoute = new Route(elem, routerRef, true);
//       parent && parent.setDynamicChild(newRoute);
//     } else {
//       var newRoute = new Route(elem, routerRef);
//     }
//     if (i === length - 1 && handler) {
//       eventHandlerType &&
//         handler &&
//         newRoute.setHTTPMethodEventHandler(eventHandlerType, handler);
//     }
//     if (!base) {
//       base = newRoute;
//     }
//     if (parent) {
//       parent.children[elem] = newRoute;
//     }
//     parent = newRoute;
//   });
//   if (!!base) {
//     return base;
//   }
//   throw new Error("Cannot make route for an empty path!");
// }

// function createPathChain(path: string): Array<string> {
//   const length = path.length;
//   // Check if path is empty string
//   if (length < 1) {
//     throw new Error("");
//   }

//   let actualPath = path;
//   if (length > 1 && path.startsWith("/")) {
//     actualPath = actualPath.slice(1);
//   }

//   if (path.endsWith("/")) {
//     actualPath = actualPath.slice(0, -1);
//   }

//   if (!actualPath) {
//     throw new Error("");
//   }

//   return actualPath.split("/");
// }

// class Route {
//   children: Record<string, Route>;
//   value: string;
//   routerRef: Router;
//   isDynamic: boolean;
//   dynamicChild?: Route;
//   middleware: Array<Middleware>;
//   private getHandler?: EventHandler;
//   private postHandler?: EventHandler;
//   private putHandler?: EventHandler;
//   private headHandler?: EventHandler;
//   private deleteHandler?: EventHandler;
//   private patchHandler?: EventHandler;
//   private optionsHandler?: EventHandler;
//   constructor(path: string, routerRef: Router, isDynamic?: boolean) {
//     this.children = {};
//     this.value = path;
//     this.routerRef = routerRef;
//     this.isDynamic = isDynamic || false;
//     this.middleware = [];
//   }

//   get(path: string, handler: EventHandler) {
//     this.routerRef.mount(path, this, "get", handler);
//   }

//   post(path: string, handler: EventHandler) {
//     this.routerRef.mount(path, this, "post", handler);
//   }

//   put(path: string, handler: EventHandler) {
//     this.routerRef.mount(path, this);
//   }

//   head(path: string, handler: EventHandler) {
//     this.routerRef.mount(path, this);
//   }

//   delete(path: string, handler: EventHandler) {
//     this.routerRef.mount(path, this);
//   }

//   patch(path: string, handler: EventHandler) {
//     this.routerRef.mount(path, this);
//   }

//   options(path: string, handler: EventHandler) {
//     this.routerRef.mount(path, this);
//   }

//   setDynamicChild(child: Route): void {
//     if (!!this.dynamicChild) {
//       console.log(
//         "Warning: Duplicate Dynamic Routes in the same position. Ignoring recent."
//       );
//       return;
//     }
//     this.dynamicChild = child;
//   }

//   setHTTPMethodEventHandler(method: HTTPMethod, func: EventHandler): void {
//     switch (method) {
//       case "get":
//         this.getHandler = func;
//         break;
//       case "post":
//         this.postHandler = func;
//         break;
//       case "put":
//         this.putHandler = func;
//         break;
//       case "head":
//         this.headHandler = func;
//         break;
//       case "delete":
//         this.deleteHandler = func;
//         break;
//       case "patch":
//         this.patchHandler = func;
//         break;
//       case "options":
//         this.optionsHandler = func;
//         break;
//     }
//   }
// }

// class Server {
//   router: Router;
//   constructor(path: string = "/") {
//     this.router = new Router(path);
//   }

//   mount(path: string, middleware?: Array<Function>): Route {
//     return this.router.mount(path);
//   }

//   printRoutes() {
//     this.router.print();
//   }
// }

// class Router {
//   routes: Set<Route>;
//   baseRoute: Route;
//   constructor(basePath: string = "/") {
//     this.baseRoute = new Route("/", this);
//     this.routes = new Set<Route>([]);
//     this.routes.add(this.baseRoute);
//   }

//   findMountableNode(
//     pathChain: Array<string>,
//     mountTo?: Route
//   ): MountInstructions {
//     const helper = (index: number, route: Route): MountInstructions => {
//       if (index === pathChain.length - 1) {
//         if (!(pathChain[index] in route.children)) {
//           return {
//             startIndex: pathChain.length - 1,
//             node: route,
//             sameEnd: false,
//           };
//         }
//         return { startIndex: pathChain.length - 1, node: route, sameEnd: true };
//       }
//       if (!(pathChain[index] in route.children)) {
//         return { startIndex: index, node: route, sameEnd: false };
//       }
//       return helper(index + 1, route.children[pathChain[index]]);
//     };
//     const result = helper(0, mountTo || this.baseRoute);
//     return result;
//   }

//   addNewRouteToSet(route: Route) {
//     route && this.routes.add(route);
//     const child = Object.values(route.children)[0];
//     child && this.addNewRouteToSet(child);
//   }

//   // Agregates all variables that are suppose to be past down
//   // * middleware
//   // need to test if copy is needed
//   // syncAllNewChildren(start: Route, parent: Route) {
//   //   let middleware = parent.middleware.slice(0); // Copy
//   //   const helper = (current: Route, par: Route) => {
//   //     middleware = [...middleware, ...current.middleware];
//   //     current.middleware = middleware.slice(0); // Copy
//   //   };
//   //   helper(start, parent);
//   // }

//   mount(
//     path: string,
//     mountTo?: Route,
//     handlerType?: EventHandlerType,
//     handler?: EventHandler
//   ): Route {
//     const pathChain = createPathChain(path);
//     const instr = this.findMountableNode(pathChain, mountTo);
//     if (instr.sameEnd) {
//       throw Error("Cannot mount duplicate url path!");
//     }
//     const newPathChain = pathChain.slice(instr.startIndex);
//     var route = routeMaker(newPathChain, this, handlerType, handler);
//     this.addNewRouteToSet(route);
//     const base: Route = mountTo || instr.node;
//     base.children[newPathChain[0]] = route;
//     // Check if first new child is a dynamic
//     route.isDynamic && base.setDynamicChild(route);
//     // this.syncAllNewChildren(base, base.children[newPathChain[0]]);
//     return route;
//   }

//   routeRequest(path: string, request: Request): Response {
//     // make sure Request is a pointer to object
//     const pathSteps = createPathChain(path);
//     // Activate all mw function and carry reponse payload
//     const response = new Response();
//     let currentRoute = this.baseRoute;
//     pathSteps.forEach((step) => {
//       // Run all middleware
//       currentRoute.middleware.forEach((mw) => {
//         mw(request, response);
//       });
//       if (!(step in currentRoute.children)) {
//         if (!!currentRoute.dynamicChild) {
//           currentRoute = currentRoute.dynamicChild;
//         } else {
//           console.error("invalid http path request header", request);
//           // return redirect response later to 404 not found
//         }
//       } else {
//         currentRoute = currentRoute.children[step];
//       }
//     });
//     // TODO Reached specific route object activate right handlers
//     return response;
//   }

//   // Router Tree Navigation
//   route(start: Route) {}

//   getRoute(url: string) {}

//   print() {
//     console.log(
//       treeify.asTree((this.baseRoute as unknown) as TreeObject, true, false)
//     );
//   }
// }

// var serv = new Server("/");
// var userRoutes = serv.mount("/users/");
// var newRoute = serv.mount("/users/new/");
// userRoutes.get("/settings/", () => console.log("In the settings route!"));
// userRoutes.get("/<profile>/view", () => console.log("in route w dynamic name"));
// serv.printRoutes();
// serv.router.routeRequest("/users/cashd/view", new Request());
// serv.printRoutes();

import Server from "./Server";
export default Server;
