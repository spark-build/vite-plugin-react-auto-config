export const resolveGenerateRouterPath = (...args: string[]) =>
  `router/${args.join('/')}`.replace(/\/\//g, '/');
