const validator = require('validator');

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// IP validation middleware
const validateIP = (req, res, next) => {
  const { ip } = req.params;
  
  if (!ip || !validator.isIP(ip)) {
    return res.status(400).json({ 
      error: 'Invalid IP address format',
      provided: ip
    });
  }
  
  next();
};

// Domain validation middleware
const validateDomain = (req, res, next) => {
  const { domain } = req.params;
  
  if (!domain || !validator.isFQDN(domain)) {
    return res.status(400).json({ 
      error: 'Invalid domain format',
      provided: domain
    });
  }
  
  next();
};

// Sanitize search query
const sanitizeQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  
  // Remove potentially dangerous characters
  return query
    .replace(/[<>\"']/g, '')
    .trim()
    .substring(0, 1000); // Limit query length
};

// Parse CIDR notation
const parseCIDR = (cidr) => {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  return cidrRegex.test(cidr);
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate random ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Validate port number
const isValidPort = (port) => {
  const portNum = parseInt(port);
  return portNum >= 1 && portNum <= 65535;
};

// Rate limiting key generator
const generateRateLimitKey = (req) => {
  return req.ip + ':' + req.path;
};

// Extract IP from request (handles proxies)
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// Log request for debugging
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = getClientIP(req);
  
  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
  next();
};

// Validate JSON body
const validateJSON = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required' });
    }
  }
  next();
};

// Security headers
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Check API key (if required)
const checkApiKey = (req, res, next) => {
  // Skip API key check for development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }
  
  // Validate API key format
  if (apiKey.length < 32) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }
  
  next();
};

// Format error response
const formatErrorResponse = (error, req) => {
  const timestamp = new Date().toISOString();
  const requestId = generateId();
  
  return {
    error: error.message || 'Internal Server Error',
    timestamp,
    requestId,
    path: req.originalUrl,
    method: req.method
  };
};

// Pagination helper
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

// Sort helper
const getSortOptions = (req, allowedFields = []) => {
  const sortBy = req.query.sortBy;
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
  
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return null;
  }
  
  return { sortBy, sortOrder };
};

// Filter helper
const getFilters = (req, allowedFilters = []) => {
  const filters = {};
  
  allowedFilters.forEach(filter => {
    if (req.query[filter]) {
      filters[filter] = req.query[filter];
    }
  });
  
  return filters;
};

// Convert object to query string
const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};

module.exports = {
  asyncHandler,
  validateIP,
  validateDomain,
  sanitizeQuery,
  parseCIDR,
  formatFileSize,
  generateId,
  isValidPort,
  generateRateLimitKey,
  getClientIP,
  logRequest,
  validateJSON,
  securityHeaders,
  checkApiKey,
  formatErrorResponse,
  getPagination,
  getSortOptions,
  getFilters,
  objectToQueryString
};