import { EventHandler, EventHandlerType, Route } from "../Route";
import Router from "../Router";

export function routeMaker(
  path: Array<string>,
  routerRef: Router,
  eventHandlerType?: EventHandlerType,
  handler?: EventHandler
): Route {
  const length = path.length;
  var base: Route | null = null;
  var parent: Route | null = null;
  path.forEach((elem, i) => {
    // Do a regex check here instead later for dyanmic path
    if (elem.includes("<") && elem.includes(">")) {
      var newRoute = new Route(elem, routerRef, true);
      parent && parent.setDynamicChild(newRoute);
    } else {
      var newRoute = new Route(elem, routerRef);
    }
    if (i === length - 1 && handler) {
      eventHandlerType &&
        handler &&
        newRoute.setHTTPMethodEventHandler(eventHandlerType, handler);
    }
    if (!base) {
      base = newRoute;
    }
    if (parent) {
      parent.children[elem] = newRoute;
    }
    parent = newRoute;
  });
  if (!!base) {
    return base;
  }
  throw new Error("Cannot make route for an empty path!");
}

export function createPathChain(path: string): Array<string> {
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

export default { routeMaker, createPathChain };
