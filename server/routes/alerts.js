const express = require('express');
const router = express.Router();
const shodanService = require('../services/shodanService');
const { asyncHandler, validateIP } = require('../utils/helpers');

// Get all alerts
router.get('/', asyncHandler(async (req, res) => {
  const cacheKey = 'user_alerts';
  let alerts = req.cache.get(cacheKey);
  
  if (alerts) {
    return res.json({ data: alerts, cached: true });
  }

  alerts = await shodanService.getAlerts();
  req.cache.set(cacheKey, alerts, 300); // Cache for 5 minutes
  
  res.json({ data: alerts, cached: false });
}));

// Create new alert
router.post('/', asyncHandler(async (req, res) => {
  const { name, ip, expires } = req.body;
  
  if (!name || !ip) {
    return res.status(400).json({ error: 'Name and IP are required' });
  }

  // Validate IP format
  if (!require('validator').isIP(ip) && !require('validator').isCIDR(ip)) {
    return res.status(400).json({ error: 'Invalid IP address or CIDR format' });
  }

  const alert = await shodanService.createAlert(name, ip, expires);
  
  // Clear cached alerts
  req.cache.del('user_alerts');
  
  res.status(201).json({ data: alert });
}));

// Delete alert
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Alert ID is required' });
  }

  await shodanService.deleteAlert(id);
  
  // Clear cached alerts
  req.cache.del('user_alerts');
  
  res.json({ message: 'Alert deleted successfully' });
}));

// Trigger scan
router.post('/scan', asyncHandler(async (req, res) => {
  const { port, protocol = 'tcp' } = req.body;
  
  if (!port) {
    return res.status(400).json({ error: 'Port is required' });
  }

  const scan = await shodanService.scanInternet(port, protocol);
  res.json({ data: scan });
}));

// Get scan status
router.get('/scan/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Scan ID is required' });
  }

  const cacheKey = `scan_status_${id}`;
  let status = req.cache.get(cacheKey);
  
  if (status) {
    return res.json({ data: status, cached: true });
  }

  status = await shodanService.getScanStatus(id);
  req.cache.set(cacheKey, status, 60); // Cache for 1 minute
  
  res.json({ data: status, cached: false });
}));

module.exports = router;