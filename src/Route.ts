import Router from "./Router";

import type { ServerResponse, IncomingHttpHeaders } from "http";
import Response from "./Response";

export interface Request {
  headers: IncomingHttpHeaders;
  method: HTTPMethod;
  url: string;
  body: any;
  params: Record<string, string>;
}

export type EventHandler = (
  req: Request,
  res: Response,
  store?: object
) => DocumentResponse;

export type EventHandlerType =
  | "GET"
  | "POST"
  | "PUT"
  | "HEAD"
  | "DELETE"
  | "PATCH"
  | "OPTIONS";

export type HTTPMethod = EventHandlerType;

export type HttpHandlers = Record<HTTPMethod, EventHandler>;

export type DocumentResponse = object;

export type Middleware = (req: Request, res: Response, store?: object) => void;

export class Route {
  children: Record<string, Route>;
  value: string;
  routerRef: Router;
  isDynamic: boolean;
  dynamicChild?: Route;
  middleware: Array<Middleware>;
  httpHandlers: HttpHandlers;
  public getHandler?: EventHandler;
  public postHandler?: EventHandler;
  public putHandler?: EventHandler;
  public headHandler?: EventHandler;
  public deleteHandler?: EventHandler;
  public patchHandler?: EventHandler;
  public optionsHandler?: EventHandler;
  constructor(path: string, routerRef: Router, isDynamic?: boolean) {
    this.children = {};
    this.value = path;
    this.routerRef = routerRef;
    this.isDynamic = isDynamic || false;
    this.middleware = [];
    this.httpHandlers = {
      GET: () => ({}),
      POST: () => ({}),
      PUT: () => ({}),
      HEAD: () => ({}),
      DELETE: () => ({}),
      PATCH: () => ({}),
      OPTIONS: () => ({}),
    };
  }

  get(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "GET", handler);
  }

  post(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "POST", handler);
  }

  put(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "PUT", handler);
  }

  head(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "HEAD", handler);
  }

  delete(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "DELETE", handler);
  }

  patch(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "PATCH", handler);
  }

  options(path: string, handler: EventHandler) {
    this.routerRef.mount(path, this, "OPTIONS", handler);
  }

  addMiddleware(mw: Middleware | Array<Middleware>) {
    if (Array.isArray(mw)) {
      this.middleware = this.middleware.concat(mw);
    } else {
      this.middleware.push(mw);
    }
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
    this.httpHandlers[method] = func;
  }
}

export default Route;
