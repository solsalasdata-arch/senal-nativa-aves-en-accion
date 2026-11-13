import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

// `npm run dev` has no Vercel runtime: serve the functions in /api from the dev server
function devApiFunctions(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api-functions',
    configureServer(server) {
      if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      if (env.GEMINI_MODEL && !process.env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;
      server.middlewares.use('/api/identify-bird', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/identify-bird.ts');
          await mod.default(req, res);
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({error: 'dev_api_failed'}));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  return {
    plugins: [react(), tailwindcss(), devApiFunctions(loadEnv(mode, process.cwd(), ''))],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
