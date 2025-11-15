import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginNodePolyfill(),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      babelLoaderOptions(opts) {
        opts.plugins?.unshift('babel-plugin-react-compiler');
      },
    }),
  ],
});
