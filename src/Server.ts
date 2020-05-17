import {
  createServer,
  ServerResponse,
  IncomingMessage,
  Server as HttpServer,
} from "http";

import Response from "./Response";
import Router from "./Router";
import Route, { HTTPMethod } from "./Route";
import type { RequestPayload } from "./Router";

export class Server {
  public router: Router;
  public route: Route;

  private server: HttpServer;
  private postProcessorCallbacks: Record<string, Function>;

  constructor(path: string = "/") {
    this.router = new Router(path);
    this.route = this.router.baseRoute;
    this.requestHandler = this.requestHandler.bind(this);
    this.server = createServer((req, res) => this.requestHandler(req, res));
    this.postProcessorCallbacks = {
      "application/json": (body: any) => {
        return JSON.stringify(body);
      },
    };
  }

  addPostProcessor(contentType: string, func: Function) {
    this.postProcessorCallbacks[contentType] = func;
  }

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

  decodeBody(contentType: string, body: string) {
    // if (contentType === 'application/json')
    return JSON.parse(body);
  }

  requestHandler(request: IncomingMessage, response: ServerResponse) {
    const url = request.url;
    const httpMethod = request.method;

    // To appease typescript
    if (!!url && !!httpMethod) {
      const buffer: Array<any> = [];
      request
        .on("data", (chunk) => {
          buffer.push(chunk);
        })
        .on("end", () => {
          // default to text eventually or blob
          const body = this.decodeBody(
            request.headers["content-type"] || "application/json",
            Buffer.concat(buffer).toString()
          );
          const payload: RequestPayload = {
            store: { params: {} },
            request: {
              body,
              url,
              params: {},
              headers: request.headers,
              method: httpMethod as HTTPMethod,
            },
            response: new Response(response),
          };
          const finalRoute = this.router.start(url, payload);
          if (finalRoute.httpHandlers[httpMethod as HTTPMethod]) {
            const output = finalRoute.httpHandlers[httpMethod as HTTPMethod](
              payload.request,
              payload.response,
              payload.store
            );

            const contentType =
              payload.response.desiredContentType || "application/json";
            if (payload.response.postProcessorCallback) {
              response.write(payload.response.postProcessorCallback(output));
            } else {
              if (contentType && this.postProcessorCallbacks[contentType]) {
                response.write(
                  this.postProcessorCallbacks[contentType](output)
                );
              } else {
                // Figure out what to default output to
                console.error("Did not specify valid content-type header!");
              }
            }
          } else {
            response.writeHead(404);
          }
          response.end();
        });
    }
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
