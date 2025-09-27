/**
 * GoEvergreen.shop Cloudflare Worker
 * Proxies WordPress content with custom branding and SEO optimization
 */

import { handleRequest } from './handlers/router.js';
import { initDatabase } from './utils/database.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // Initialize database on first request
      await initDatabase(env.DB);
      
      // Handle the request with custom routing
      return await handleRequest(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      });
    }
  },

  async scheduled(controller, env, ctx) {
    // Handle scheduled tasks like newsletter processing
    console.log('Scheduled task triggered:', controller.scheduledTime);
  }
};