import type { Path, To } from 'history';

import { parsePath } from 'history';
import { resolvePath } from "react-router-dom";

/**
 * @refs https://github.com/remix-run/react-router/blob/fceae429c1c45a97e3482838434ba56f7ad9fe4c/packages/react-router/index.tsx?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L1366
 */
export const joinPaths = (paths: string[]): string =>
  paths.join("/").replace(/\/\/+/g, "/");

/**
 * @refs https://github.com/remix-run/react-router/blob/fceae429c1c45a97e3482838434ba56f7ad9fe4c/packages/react-router/index.tsx?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L1286
 */
export function resolveTo(toArg: To, routePathnames: string[], locationPathname: string): Path {
  let to = typeof toArg === 'string' ? parsePath(toArg) : toArg;
  let toPathname = toArg === '' || to.pathname === '' ? '/' : to.pathname;

  // If a pathname is explicitly provided in `to`, it should be relative to the
  // route context. This is explained in `Note on `<Link to>` values` in our
  // migration guide from v5 as a means of disambiguation between `to` values
  // that begin with `/` and those that do not. However, this is problematic for
  // `to` values that do not provide a pathname. `to` can simply be a search or
  // hash string, in which case we should assume that the navigation is relative
  // to the current location's pathname and *not* the route pathname.
  let from: string;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;

    if (toPathname.startsWith('..')) {
      let toSegments = toPathname.split('/');

      // Each leading .. segment means "go up one route" instead of "go up one
      // URL segment".  This is a key difference from how <a href> works and a
      // major reason we call this a "to" value instead of a "href".
      while (toSegments[0] === '..') {
        toSegments.shift();
        routePathnameIndex -= 1;
      }

      to.pathname = toSegments.join('/');
    }

    // If there are more ".." segments than parent routes, resolve relative to
    // the root / URL.
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : '/';
  }

  let path = resolvePath(to, from);

  // Ensure the pathname has a trailing slash if the original to value had one.
  if (
    toPathname &&
    toPathname !== '/' &&
    toPathname.endsWith('/') &&
    !path.pathname.endsWith('/')
  ) {
    path.pathname += '/';
  }

  return path;
}
