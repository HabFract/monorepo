import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import postcss from "rollup-plugin-postcss";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist/types',
      // Skip node_modules
      exclude: ['node_modules/**'],
    }),

    // Custom plugin to handle @ui imports
    {
      name: 'resolve-ui-imports',
      resolveId(source, importer) {
        if (source.startsWith('@ui')) {
          const resolved = resolveUiImport(source, importer);
          console.log(`Resolving ${source} to ${resolved}`);
          return resolved;
        }
        return null;
      }
    }
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^antd/,
        /^@ant-design/,
        /^rc-/,
        '@ctrl/tinycolor',
        'classnames',
        'luxon',
        '@babel/runtime',
        // Add a catch-all for node_modules
        /^node_modules/,
        // Add a regex to match all npm package names
        /^[^./]|^\.[^./]|^\.\.[^/]/  // This matches anything that doesn't start with ./ or ../
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    // Ensure we're not processing node_modules
    modulePreload: {
      polyfill: false
    },
    sourcemap: false,
    minify: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../ui/src')
    }
  },
  optimizeDeps: {
    exclude: ['node_modules/**']
  }
});

// Helper function to resolve UI package imports
function resolveUiImport(source: string, importer: string | undefined) {
  if (!importer) return source;
  
  // Remove '@ui/' or '@ui/src/' from the start of the import
  const importPath = source.replace(/^@ui(\/src)?\//, '');
  
  // Get the directory of the importing file
  const importerDir = path.dirname(importer);
  
  // Calculate the relative path to the ui package's src directory
  const uiSrcPath = path.resolve(__dirname, '../ui/src');
  const relativePath = path.relative(importerDir, uiSrcPath);
  
  // Combine the relative path with the import path
  return `${relativePath}/${importPath}`;
}