import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { db } from '@db';
import { newsArticles, trends } from '@db/schema';
import { desc } from 'drizzle-orm';
import type { IncomingMessage } from 'http';

interface VerifyClientInfo {
  origin: string;
  secure: boolean;
  req: IncomingMessage;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    verifyClient: (info: VerifyClientInfo) => {
      // Skip verification for Vite HMR websocket connections
      return info.req.headers['sec-websocket-protocol'] !== 'vite-hmr';
    }
  });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Broadcast updates to all clients
  async function broadcastUpdates() {
    try {
      const latestNews = await db.select().from(newsArticles)
        .orderBy(desc(newsArticles.publishDate))
        .limit(5);

      const latestTrends = await db.select().from(trends)
        .orderBy(desc(trends.frequency))
        .limit(10);

      const message = JSON.stringify({
        type: 'update',
        payload: {
          news: latestNews,
          trends: latestTrends
        }
      });

      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Failed to broadcast updates:', error);
    }
  }

  // Broadcast updates every minute
  setInterval(broadcastUpdates, 60000);

  return wss;
}