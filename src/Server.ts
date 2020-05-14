import Router from "./Router";
import Route, { HTTPMethod, EventHandler } from "./Route";

import type { RequestPayload } from "./Router";

import {
  createServer,
  ServerResponse,
  IncomingMessage,
  Server as HttpServer,
} from "http";
import isUrl from "validator/lib/isUrl";

const HTTP_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
  "HEAD",
]);

export class Server {
  public router: Router;
  public route: Route;
  // public requestHandler: Function;
  private server: HttpServer;
  constructor(path: string = "/") {
    this.router = new Router(path);
    this.route = this.router.baseRoute;
    this.requestHandler = (
      request: IncomingMessage,
      response: ServerResponse
    ) => {
      const url = request.url;
      const httpMethod = request.method;

      // To appease typescript
      if (!!url && !!httpMethod) {
        const payload: RequestPayload = {
          store: {},
          params: {},
          request,
          response,
        };
        const finalRoute = this.router.start(url, payload);
        if (finalRoute.httpHandlers[httpMethod as HTTPMethod]) {
          const output = finalRoute.httpHandlers[httpMethod as HTTPMethod](
            payload.request,
            payload.response,
            payload.store
          );
          // Assuming json output for now
          // TODO: Add multiple return content types
          response.writeHead(200, "Content-Type: application/json");
          // TODO: Check if stringify needs to be recursive
          response.write(JSON.stringify(output));
        } else {
          // TODO: Throw NoResourceFoundError
          response.writeHead(404);
          response.write(404);
        }
      }
      response.end();
    };
    this.server = createServer((req, res) => this.requestHandler(req, res));
  }

  // this.requestHandler = this.bind

  mount(path: string, middleware?: Array<Function>): Route {
    return this.router.mount(path);
  }

  // Might be redudant
  // validateIncomingMessage(message: IncomingMessage) {
  //   const validUrl = message.url && isUrl(message.url);
  //   const validMethod = message.method && HTTP_METHODS.has(message.method);
  //   return (
  //     !!message.url &&
  //     isUrl(message.url) &&
  //     !!message.method &&
  //     HTTP_METHODS.has(message.method)
  //   );
  // }

  requestHandler(request: IncomingMessage, response: ServerResponse) {
    const url = request.url;
    const httpMethod = request.method;

    // To appease typescript
    if (!!url && !!httpMethod) {
      const payload: RequestPayload = {
        store: {},
        params: {},
        request,
        response,
      };
      const finalRoute = this.router.start(url, payload);
      if (finalRoute.httpHandlers[httpMethod as HTTPMethod]) {
        const output = finalRoute.httpHandlers[httpMethod as HTTPMethod](
          payload.request,
          payload.response,
          payload.store
        );
        // Assuming json output for now
        // TODO: Add multiple return content types
        response.writeHead(200, "Content-Type: application/json");
        // TODO: Check if stringify needs to be recursive
        response.write(JSON.stringify(output));
      } else {
        // TODO: Throw NoResourceFoundError
        response.writeHead(404);
      }
    }
    response.end();
  }

  run(port?: number, hostname?: string) {
    // TODO: validate *args here
    this.server.listen(port || 8000);
  }

  printRoutes() {
    this.router.print();
  }
}

export default Server;
