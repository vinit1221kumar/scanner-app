import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { Server } from 'socket.io';
import {
  CORS_CREDENTIALS,
  CORS_ORIGIN,
  PORT,
  SERVICE_NAME,
} from './config.js';
import { setupSocketServer } from './socket.js';

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: CORS_CREDENTIALS }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: SERVICE_NAME });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: CORS_CREDENTIALS,
  },
  maxHttpBufferSize: 10 * 1024 * 1024,
  pingInterval: 25000,
  pingTimeout: 60000,
});

setupSocketServer(io);

httpServer.listen(PORT, () => {
  console.log(`Scanner server running on http://localhost:${PORT}`);
});
