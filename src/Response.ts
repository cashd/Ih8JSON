import { HttpStatusCode } from "./utils/constants";
import { ServerResponse } from "http";

// Wrapper Class for node/Http ServerResponse class
class Response {
  public desiredContentType?: string;
  public postProcessorCallback?: Function;
  public serverResponseRef: ServerResponse;

  constructor(serverRes: ServerResponse) {
    this.serverResponseRef = serverRes;
  }

  contentLength(legnth: number) {
    this.serverResponseRef.setHeader("Content-Length", legnth);
  }

  contentType(type: string) {
    this.serverResponseRef.setHeader("Content-Type", type);
    this.desiredContentType = type;
  }

  statusCode(code: HttpStatusCode) {
    this.serverResponseRef.statusCode = code;
  }
}

export default Response;
