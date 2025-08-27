import path from "path";
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins
  plugins: [react(), tailwindcss()],

  // Server configuration for development
  server: {
    // Set the port to 3000 as specified
    port: 3000,
    host: true, // Allow access from network (useful for mobile testing)
    // Configure a proxy to forward API requests to the Django backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    // macOS specific optimizations
    watch: {
      usePolling: false, // Better performance on macOS
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
    // Faster HMR on macOS
    hmr: {
      overlay: true,
    },
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Build configuration for production
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },

  // // CSS preprocessor options
  // css: {
  //   preprocessorOptions: {
  //     css: {
  //       additionalData: '@import "@/styles/global.css";',
  //     },
  //   },
  // },
  
  // Esbuild options
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  // Define global variables
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['@radix-ui/react-slot', 'class-variance-authority'],
    entries: ['./src/main.tsx'],
  },
  
  // Test configuration would go here if using Vitest
  // test: {
  //   globals: true,
  //   environment: 'jsdom',
  //   setupFiles: './src/setupTests.ts',
  //   css: true,
  //   coverage: {
  //     provider: 'istanbul',
  //     reporter: ['text', 'json', 'html'],
  //     exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.tsx'],
  //   },
  // },

  // Other configurations
  cacheDir: 'node_modules/.vite',
  clearScreen: false,
  logLevel: 'info',
  base: '/',
  publicDir: 'public',
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  worker: {
    format: 'es',
    // plugins: [],
  },
  ssr: {
    noExternal: ['@radix-ui/react-slot', 'class-variance-authority'],
  },
});
