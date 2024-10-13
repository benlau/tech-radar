import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript(),
      commonjs(),
    ],
    external: ['d3'],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'TechRadar',
        sourcemap: true,
        globals: {
          'd3': 'd3'
        }
      },
      {
        file: 'dist/index.umd.min.js',
        format: 'umd',
        name: 'TechRadar',
        sourcemap: true,
        globals: {
          'd3': 'd3'
        },
        plugins: [terser()]
      }
    ],
    plugins: [
      typescript(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
