export default {
  cjs: 'babel',
  esm: 'babel',
  target: 'node',
  nodeVersion: 16,
  preCommit: {
    eslint: true,
    prettier: true,
  },
  disableTypeCheck: false,
  typescriptOpts: {
    check: false,
  }
};
