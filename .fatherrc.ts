export default {
  cjs: 'babel',
  // esm: { type: 'babel', importLibToEs: true },
  target: 'node',
  nodeVersion: 14,
  preCommit: {
    eslint: true,
    prettier: true,
  },
  disableTypeCheck: false,
  typescriptOpts: {
    check: false,
  }
};
