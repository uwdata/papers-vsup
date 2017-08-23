import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/index.js',
  dest: 'dist/bvu.js',
  moduleName: 'bvu',
  format: 'iife',
  plugins: [
    resolve()
  ]
};
