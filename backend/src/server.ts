import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config, validateConfig } from './config/env.js';
import { initializeWebSocket } from './websocket/socketHandler.js';
import { cacheService } from './services/cacheService.js';

// Validate configuration
validateConfig();

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Get specific OSH rule (placeholder - would query from database)
app.get('/api/rules/:ruleNumber', async (req, res) => {
  const { ruleNumber } = req.params;

  // In production, query from PostgreSQL
  const rules: Record<string, { title: string; summary: string }> = {
    '1020': {
      title: 'Registration',
      summary: 'All establishments must register with DOLE Regional Office within 30 days of operation.',
    },
    '1030': {
      title: 'Training of Personnel',
      summary: 'Mandatory OSH training for all workers. Safety Officers must complete prescribed training hours.',
    },
    '1040': {
      title: 'Health and Safety Committee',
      summary: 'Required for establishments with 10+ workers. Monthly meetings for hazardous workplaces.',
    },
    '1050': {
      title: 'Notification and Recordkeeping',
      summary: 'Report work accidents within 5 days using WAIR. Maintain records for 5 years.',
    },
    '1070': {
      title: 'Occupational Health and Environmental Control',
      summary: 'Threshold Limit Values, workplace monitoring, and control hierarchy requirements.',
    },
    '1080': {
      title: 'Personal Protective Equipment',
      summary: 'Employer must provide PPE at no cost. Training on proper use required.',
    },
    '1090': {
      title: 'Hazardous Materials',
      summary: 'GHS-compliant labeling, SDS availability, proper storage and handling.',
    },
    '1960': {
      title: 'Occupational Health Services',
      summary: 'Company physician requirements, first aid facilities, medical examinations.',
    },
  };

  const rule = rules[ruleNumber];
  if (rule) {
    res.json({ ruleNumber, ...rule });
  } else {
    res.status(404).json({ error: 'Rule not found' });
  }
});

// Search knowledge base
app.get('/api/search', async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // In production, implement full-text search with PostgreSQL
  res.json({
    query: q,
    results: [],
    message: 'Search functionality requires database setup',
  });
});

// List past sessions (placeholder)
app.get('/api/sessions', async (req, res) => {
  res.json({
    sessions: [],
    message: 'Session history requires database setup',
  });
});

// Get session details (placeholder)
app.get('/api/sessions/:id', async (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    message: 'Session details require database setup',
  });
});

// Initialize WebSocket
const io = initializeWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await cacheService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await cacheService.disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    INTERVEE Backend                       ║
║      Philippine OSH Practitioner Interview Assistant      ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${config.port}                            ║
║  Environment: ${config.nodeEnv.padEnd(40)}║
║  WebSocket: Ready                                         ║
║  Cache: ${config.cacheEnabled ? 'Enabled' : 'Disabled'}                                          ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, server, io };
