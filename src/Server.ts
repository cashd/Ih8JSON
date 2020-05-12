import Router from "./Router";
import Route from "./Route";

import {
  createServer,
  RequestListener,
  ServerResponse,
  IncomingMessage,
} from "http";

export class Server {
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

export default Server;
