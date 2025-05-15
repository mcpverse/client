import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "MCPVerseClientLib", // UMD build name (not strictly necessary if not generating UMD)
      formats: ["es", "cjs"], // Generate ES Module and CommonJS formats
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      // into your library (e.g., the core MCP SDK)
      external: [
        "@modelcontextprotocol/sdk",
        "@modelcontextprotocol/sdk/types.js",
        /^node:/, // Externalize Node.js built-ins
      ],
    },
    // Target environment (Node.js for this library)
    target: "es2017", // Broader compatibility
    // Ensure sourcemaps are generated if desired
    sourcemap: true,
  },
  plugins: [
    dts({
      // Specify the entry point for generating types
      entryRoot: resolve(__dirname, "src"),
      // Use outDir instead of outputDir
      outDir: resolve(__dirname, "dist/types"), // Output types to a subfolder
      // Insert TS types into ES module build
      insertTypesEntry: true,
      // Exclude test files from declaration generation
      exclude: [
        "**/__tests__/**",
        "**/*.spec.ts",
        "**/*.test.ts",
        "tests/**", // Exclude the entire tests directory
      ],
      // Optional: specify tsconfig file path
      // tsconfigPath: 'tsconfig.json'
    }),
  ],
});
