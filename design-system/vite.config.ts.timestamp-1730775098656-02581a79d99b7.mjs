// vite.config.ts
import { defineConfig } from "file:///home/nickstebb/Code/habitfract/monorepo/packages/node_modules/.pnpm/vite@5.4.8_@types+node@22.8.1/node_modules/vite/dist/node/index.js";
import react from "file:///home/nickstebb/Code/habitfract/monorepo/packages/node_modules/.pnpm/@vitejs+plugin-react@4.3.3_vite@5.4.8/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dts from "file:///home/nickstebb/Code/habitfract/monorepo/packages/node_modules/.pnpm/vite-plugin-dts@4.3.0_@types+node@22.8.1_typescript@5.6.3_vite@5.4.8/node_modules/vite-plugin-dts/dist/index.mjs";
import postcss from "file:///home/nickstebb/Code/habitfract/monorepo/packages/node_modules/.pnpm/rollup-plugin-postcss@4.0.2_postcss@8.4.47/node_modules/rollup-plugin-postcss/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/nickstebb/Code/habitfract/monorepo/packages/design-system";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: "./src/index.ts",
      name: "HabitFractDesignSystem",
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "antd",
        "react/jsx-runtime",
        "tailwindcss"
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      },
      plugins: [
        postcss({
          extract: true,
          modules: true,
          extensions: ["css"]
        })
      ]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@ui": path.resolve(__vite_injected_original_dirname, "../ui")
    }
  },
  define: {
    "process.env": {}
  },
  optimizeDeps: {
    include: ["antd"],
    exclude: ["@ant-design/icons"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9uaWNrc3RlYmIvQ29kZS9oYWJpdGZyYWN0L21vbm9yZXBvL3BhY2thZ2VzL2Rlc2lnbi1zeXN0ZW1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL25pY2tzdGViYi9Db2RlL2hhYml0ZnJhY3QvbW9ub3JlcG8vcGFja2FnZXMvZGVzaWduLXN5c3RlbS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9uaWNrc3RlYmIvQ29kZS9oYWJpdGZyYWN0L21vbm9yZXBvL3BhY2thZ2VzL2Rlc2lnbi1zeXN0ZW0vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5pbXBvcnQgcG9zdGNzcyBmcm9tIFwicm9sbHVwLXBsdWdpbi1wb3N0Y3NzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgZHRzKHtcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgY29weVB1YmxpY0RpcjogZmFsc2UsXG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogXCIuL3NyYy9pbmRleC50c1wiLFxuICAgICAgbmFtZTogXCJIYWJpdEZyYWN0RGVzaWduU3lzdGVtXCIsXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCkgPT4gYGluZGV4LiR7Zm9ybWF0fS5qc2AsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwicmVhY3QtZG9tXCIsXG4gICAgICAgIFwiYW50ZFwiLFxuICAgICAgICBcInJlYWN0L2pzeC1ydW50aW1lXCIsXG4gICAgICAgIFwidGFpbHdpbmRjc3NcIixcbiAgICAgIF0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHJlYWN0OiBcIlJlYWN0XCIsXG4gICAgICAgICAgXCJyZWFjdC1kb21cIjogXCJSZWFjdERPTVwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcG9zdGNzcyh7XG4gICAgICAgICAgZXh0cmFjdDogdHJ1ZSxcbiAgICAgICAgICBtb2R1bGVzOiB0cnVlLFxuICAgICAgICAgIGV4dGVuc2lvbnM6IFtcImNzc1wiXSxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0sXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQHVpXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vdWlcIiksXG4gICAgfSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgXCJwcm9jZXNzLmVudlwiOiB7fSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydhbnRkJ10sXG4gICAgZXhjbHVkZTogWydAYW50LWRlc2lnbi9pY29ucyddXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVyxTQUFTLG9CQUFvQjtBQUM1WSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sYUFBYTtBQUNwQixPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxJQUNmLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFVBQVUsQ0FBQyxXQUFXLFNBQVMsTUFBTTtBQUFBLElBQ3ZDO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsUUFDZjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLFFBQVE7QUFBQSxVQUNOLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxVQUNULFlBQVksQ0FBQyxLQUFLO0FBQUEsUUFDcEIsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsT0FBTyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3hDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sZUFBZSxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxNQUFNO0FBQUEsSUFDaEIsU0FBUyxDQUFDLG1CQUFtQjtBQUFBLEVBQy9CO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
