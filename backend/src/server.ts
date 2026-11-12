/**
 * ==============================================================================
 * SHOEFRESH REST API & WHATSAPP CLOUD API BACKEND SERVER (TypeScript Version)
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import whatsappRoutes from './routes/whatsappRoutes';
import { getWhatsAppConfig, isPlaceholderCredential } from './services/whatsappApi';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use('/api/whatsapp', whatsappRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    app: 'ShoeFresh Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    whatsappIntegration: 'Meta WhatsApp Cloud API (Official)',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const server = app.listen(PORT, () => {
  const config = getWhatsAppConfig();
  const isConfigured = !isPlaceholderCredential(config.accessToken) && !isPlaceholderCredential(config.phoneNumberId);
  console.log(`[ShoeFresh Backend (TS)] Running on http://localhost:${PORT}`);
  console.log(`WhatsApp Status: ${isConfigured ? 'Configured' : 'Simulation Mode'}`);
});

export { app, server };
export default app;
