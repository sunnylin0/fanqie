import esbuild from 'esbuild';

esbuild.buildSync({
  entryPoints: ['src/renderer/index.ts'],
  outfile: 'web/zhipu-local-renderer.js',
  bundle: true,
  format: 'iife',
  globalName: 'ZhipuRenderer',
  platform: 'browser',
  target: ['es2020']
});

console.log('Successfully compiled TypeScript renderer to web/zhipu-local-renderer.js!');
