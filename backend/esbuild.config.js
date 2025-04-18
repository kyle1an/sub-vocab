import { build } from 'esbuild'

build({
  entryPoints: ['api/app.ts'],
  outdir: 'api',
  allowOverwrite: true,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  // sourcemap: true,
  minify: true,
  treeShaking: true,
  // https://github.com/evanw/esbuild/issues/1921#issuecomment-1898197331
  inject: ['cjs-shim.ts'],
  legalComments: 'external',
})
