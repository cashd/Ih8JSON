import Request from "./Request";
import Response from "./Response";
import Router from "./Router";

export type EventHandler = (req: Request, res: Response) => Response | void;
export type EventHandlerType =
  | "get"
  | "post"
  | "put"
  | "head"
  | "delete"
  | "patch"
  | "options";
export type HTTPMethod = EventHandlerType;
export type Middleware = EventHandler;

export class Route {
  children: Record<string, Route>;
  value: string;
  routerRef: Router;
  isDynamic: boolean;
  dynamicChild?: Route;
  middleware: Array<Middleware>;
  private getHandler?: EventHandler;
  private postHandler?: EventHandler;
  private putHandler?: EventHandler;
  private headHandler?: EventHandler;
  private deleteHandler?: EventHandler;
  private patchHandler?: EventHandler;
  private optionsHandler?: EventHandler;
  constructor(path: string, routerRef: Router, isDynamic?: boolean) {
    this.children = {};
    this.value = path;
    this.routerRef = routerRef;
    this.isDynamic = isDynamic || false;
    this.middleware = [];
  }

  get(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "get", handler);
  }

  post(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "post", handler);
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

  setDynamicChild(child: Route): void {
    if (!!this.dynamicChild) {
      console.log(
        "Warning: Duplicate Dynamic Routes in the same position. Ignoring recent."
      );
      return;
    }
    this.dynamicChild = child;
  }

  setHTTPMethodEventHandler(method: HTTPMethod, func: EventHandler): void {
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

export default Route;
