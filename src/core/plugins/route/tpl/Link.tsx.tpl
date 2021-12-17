import { forwardRef } from 'react';
import type { LinkProps } from 'react-router-dom';

import type { RouteTo } from './types';
import { RouterHelper, isStr } from './helper';

function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * @refs https://github.com/remix-run/react-router/blob/28db30c22ef39d68980edaa8c2dfc2fbd7f43cff/packages/react-router-dom/index.tsx?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L251
 */
export const RouterHelperLink = forwardRef<
  HTMLAnchorElement,
  Omit<LinkProps, 'to'> & { to: RouteTo }
>(function LinkWithRef(
  { onClick, reloadDocument, replace = false, state, target, to, ...rest },
  ref,
) {
  let innerTo = RouterHelper.resolveRouteTo({ state, replace, ...(isStr(to) ? { path: to } : to) });

  function linkClickHandler(event: React.MouseEvent) {
    if (
      event.button === 0 && // Ignore everything but left clicks
      (!target || target === '_self') && // Let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // Ignore clicks with modifier keys
    ) {
      event.preventDefault();

      RouterHelper.instance.navigate({ ...innerTo, path: innerTo.fullPath });
    }
  }

  function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented && !reloadDocument) {
      linkClickHandler(event);
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...rest}
      href={innerTo.fullPath + innerTo.search}
      onClick={handleClick}
      ref={ref}
      target={target}
    />
  );
});
