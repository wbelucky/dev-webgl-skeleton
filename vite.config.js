import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  root: 'src',
  plugins: [viteSingleFile(), glsl()],
  build: {
    cssCodeSplit: false,
    minify: false,
    assetsInlineLimit: 100000000,
    outDir: '../dist',
  },
});
