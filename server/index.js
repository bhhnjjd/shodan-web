const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
require('dotenv').config();
const { securityHeaders } = require('./utils/helpers');

const shodanRoutes = require('./routes/shodan');
const analysisRoutes = require('./routes/analysis');
const alertRoutes = require('./routes/alerts');

const app = express();
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 300 });

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:3000', 'http://localhost:5173']),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Optional basic auth
if (process.env.APP_PASSWORD) {
  app.use((req, res, next) => {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Basic ')) {
      res.set('WWW-Authenticate', 'Basic realm="shodan-web"');
      return res.status(401).send('Authentication required');
    }
    const [, hash] = auth.split(' ');
    const [user, pass] = Buffer.from(hash, 'base64').toString().split(':');
    const expectedUser = process.env.APP_USERNAME || 'user';
    if (pass !== process.env.APP_PASSWORD || user !== expectedUser) {
      return res.status(403).send('Forbidden');
    }
    next();
  });
}

// Cache middleware
app.use((req, res, next) => {
  req.cache = cache;
  next();
});

// Routes
app.use('/api/shodan', shodanRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Shodan Mapper API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
