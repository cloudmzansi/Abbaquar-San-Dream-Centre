import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Add bundle visualizer in build mode
    command === 'build' && visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Use hashed filenames for better caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    },
    // Improve chunk loading strategy
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // Enable additional optimizations
    assetsInlineLimit: 4096, // Inline small assets
    modulePreload: true,
    reportCompressedSize: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  // Optimize dev server
  server: {
    hmr: true,
    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom',
        '@supabase/supabase-js'
      ]
    }
  }
}));
