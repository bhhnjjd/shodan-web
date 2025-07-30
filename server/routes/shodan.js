const express = require('express');
const router = express.Router();
const shodanService = require('../services/shodanService');
const { asyncHandler, validateIP, validateDomain, sanitizeQuery } = require('../utils/helpers');

// Get host information
router.get('/host/:ip', validateIP, asyncHandler(async (req, res) => {
  const { ip } = req.params;
  const cacheKey = `host_${ip}`;
  
  // Check cache first
  let hostData = req.cache.get(cacheKey);
  if (hostData) {
    return res.json({ data: hostData, cached: true });
  }

  hostData = await shodanService.getHostInfo(ip);
  
  // Cache the result
  req.cache.set(cacheKey, hostData);
  
  res.json({ data: hostData, cached: false });
}));

// Search hosts
router.get('/search', asyncHandler(async (req, res) => {
  const { q, page = 1, facets, minify = false } = req.query;
  const query = sanitizeQuery(q);
  
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const cacheKey = `search_${q}_${page}_${facets || ''}_${minify}`;
  let searchData = req.cache.get(cacheKey);
  
  if (searchData) {
    return res.json({ data: searchData, cached: true });
  }

  const options = {
    page: parseInt(page),
    minify: minify === 'true',
    facets: facets
  };

  searchData = await shodanService.searchHosts(query, options);
  req.cache.set(cacheKey, searchData);
  
  res.json({ data: searchData, cached: false });
}));

// Get search count
router.get('/count', asyncHandler(async (req, res) => {
  const { q, facets } = req.query;
  const query = sanitizeQuery(q);
  
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const cacheKey = `count_${q}_${facets || ''}`;
  let countData = req.cache.get(cacheKey);
  
  if (countData) {
    return res.json({ data: countData, cached: true });
  }

  countData = await shodanService.getHostCount(query, facets);
  req.cache.set(cacheKey, countData);
  
  res.json({ data: countData, cached: false });
}));

// Get domain information
router.get('/domain/:domain', validateDomain, asyncHandler(async (req, res) => {
  const { domain } = req.params;
  const cacheKey = `domain_${domain}`;
  
  let domainData = req.cache.get(cacheKey);
  if (domainData) {
    return res.json({ data: domainData, cached: true });
  }

  domainData = await shodanService.getDomainInfo(domain);
  req.cache.set(cacheKey, domainData);
  
  res.json({ data: domainData, cached: false });
}));

// Get API info
router.get('/api-info', asyncHandler(async (req, res) => {
  const cacheKey = 'api_info';
  let apiInfo = req.cache.get(cacheKey);
  
  if (apiInfo) {
    return res.json({ data: apiInfo, cached: true });
  }

  apiInfo = await shodanService.getApiInfo();
  req.cache.set(cacheKey, apiInfo, 3600); // Cache for 1 hour
  
  res.json({ data: apiInfo, cached: false });
}));

// Search exploits
router.get('/exploits', asyncHandler(async (req, res) => {
  const { q, page = 1, facets } = req.query;
  const query = sanitizeQuery(q);
  
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const cacheKey = `exploits_${q}_${page}_${facets || ''}`;
  let exploitData = req.cache.get(cacheKey);
  
  if (exploitData) {
    return res.json({ data: exploitData, cached: true });
  }

  const options = {
    page: parseInt(page),
    facets: facets
  };

  exploitData = await shodanService.searchExploits(query, options);
  req.cache.set(cacheKey, exploitData);
  
  res.json({ data: exploitData, cached: false });
}));

// Get services
router.get('/services', asyncHandler(async (req, res) => {
  const cacheKey = 'services';
  let services = req.cache.get(cacheKey);
  
  if (services) {
    return res.json({ data: services, cached: true });
  }

  services = await shodanService.getServices();
  req.cache.set(cacheKey, services, 86400); // Cache for 24 hours
  
  res.json({ data: services, cached: false });
}));

// Get ports
router.get('/ports', asyncHandler(async (req, res) => {
  const cacheKey = 'ports';
  let ports = req.cache.get(cacheKey);
  
  if (ports) {
    return res.json({ data: ports, cached: true });
  }

  ports = await shodanService.getPorts();
  req.cache.set(cacheKey, ports, 86400); // Cache for 24 hours
  
  res.json({ data: ports, cached: false });
}));

// Get protocols
router.get('/protocols', asyncHandler(async (req, res) => {
  const cacheKey = 'protocols';
  let protocols = req.cache.get(cacheKey);
  
  if (protocols) {
    return res.json({ data: protocols, cached: true });
  }

  protocols = await shodanService.getProtocols();
  req.cache.set(cacheKey, protocols, 86400); // Cache for 24 hours
  
  res.json({ data: protocols, cached: false });
}));

module.exports = router;
