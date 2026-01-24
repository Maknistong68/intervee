import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config, validateConfig } from './config/env.js';
import { initializeWebSocket } from './websocket/socketHandler.js';
import { cacheService } from './services/cacheService.js';
import { conversationContextService } from './services/conversationContext.js';
import { whisperCircuitBreaker, gptCircuitBreaker } from './utils/circuitBreaker.js';
import reviewerRoutes from './routes/reviewer.js';

// Validate configuration
validateConfig();

const app = express();
const server = createServer(app);

// Parse allowed origins from environment variable
const allowedOrigins = config.allowedOrigins
  ? config.allowedOrigins.split(',').map(o => o.trim())
  : ['*'];

const corsOptions = {
  origin: config.nodeEnv === 'production' && !allowedOrigins.includes('*')
    ? allowedOrigins
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: config.nodeEnv === 'production',
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Simple in-memory rate limiter (no external dependency required)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function createRateLimiter(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = rateLimitStore.get(ip);

    if (!record || now - record.windowStart > windowMs) {
      // New window
      record = { count: 1, windowStart: now };
      rateLimitStore.set(ip, record);
    } else {
      record.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.windowStart + windowMs) / 1000));

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT',
      });
    }

    next();
  };
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = config.apiRateWindowMs || 60000;
  for (const [ip, record] of rateLimitStore) {
    if (now - record.windowStart > windowMs) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000);

// Apply rate limiting to API routes
const apiLimiter = createRateLimiter(
  config.apiRateWindowMs || 60000,
  config.apiRateLimit || 30
);
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    cache: cacheService.getStats(),
    contextCount: conversationContextService.getContextCount(),
    circuitBreakers: {
      whisper: whisperCircuitBreaker.getStats(),
      gpt: gptCircuitBreaker.getStats(),
    },
  });
});

// Cache invalidation endpoint (for use after knowledge base updates)
app.post('/api/cache/invalidate', async (req, res) => {
  try {
    const result = await cacheService.invalidateAll();
    res.json({
      success: true,
      message: 'Cache invalidated successfully',
      ...result,
    });
  } catch (error) {
    console.error('[API] Cache invalidation error:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

// Cache stats endpoint
app.get('/api/cache/stats', (req, res) => {
  res.json(cacheService.getStats());
});

// Circuit breaker status and reset endpoints
app.get('/api/circuit-breakers', (req, res) => {
  res.json({
    whisper: whisperCircuitBreaker.getStats(),
    gpt: gptCircuitBreaker.getStats(),
  });
});

app.post('/api/circuit-breakers/reset', (req, res) => {
  whisperCircuitBreaker.reset();
  gptCircuitBreaker.reset();
  res.json({
    success: true,
    message: 'Circuit breakers reset',
    whisper: whisperCircuitBreaker.getStats(),
    gpt: gptCircuitBreaker.getStats(),
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

// Reviewer App routes
app.use('/api/reviewer', reviewerRoutes);

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
