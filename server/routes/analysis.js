const express = require('express');
const router = express.Router();
const shodanService = require('../services/shodanService');
const AnalysisService = require('../services/analysisService');
const { asyncHandler, validateIP } = require('../utils/helpers');

// Analyze host vulnerabilities
router.get('/vulnerabilities/:ip', validateIP, asyncHandler(async (req, res) => {
  const { ip } = req.params;
  const cacheKey = `vuln_analysis_${ip}`;
  
  let analysis = req.cache.get(cacheKey);
  if (analysis) {
    return res.json({ data: analysis, cached: true });
  }

  // Get host data from Shodan
  const hostData = await shodanService.getHostInfo(ip);
  
  // Analyze vulnerabilities
  analysis = AnalysisService.analyzeVulnerabilities(hostData);
  
  req.cache.set(cacheKey, analysis, 1800); // Cache for 30 minutes
  res.json({ data: analysis, cached: false });
}));

// Analyze host security posture
router.get('/security/:ip', validateIP, asyncHandler(async (req, res) => {
  const { ip } = req.params;
  const cacheKey = `security_analysis_${ip}`;
  
  let analysis = req.cache.get(cacheKey);
  if (analysis) {
    return res.json({ data: analysis, cached: true });
  }

  const hostData = await shodanService.getHostInfo(ip);
  analysis = AnalysisService.analyzeSecurityPosture(hostData);
  
  req.cache.set(cacheKey, analysis, 1800);
  res.json({ data: analysis, cached: false });
}));

// Generate host report
router.get('/report/:ip', validateIP, asyncHandler(async (req, res) => {
  const { ip } = req.params;
  const { format = 'json' } = req.query;
  
  const cacheKey = `report_${ip}_${format}`;
  let report = req.cache.get(cacheKey);
  
  if (report) {
    return res.json({ data: report, cached: true });
  }

  const hostData = await shodanService.getHostInfo(ip);
  report = AnalysisService.generateReport(hostData, format);
  
  req.cache.set(cacheKey, report, 3600); // Cache for 1 hour
  res.json({ data: report, cached: false });
}));

// Analyze network range
router.post('/network-scan', asyncHandler(async (req, res) => {
  const { cidr, deep = false } = req.body;
  
  if (!cidr) {
    return res.status(400).json({ error: 'CIDR range is required' });
  }

  const cacheKey = `network_scan_${cidr}_${deep}`;
  let analysis = req.cache.get(cacheKey);
  
  if (analysis) {
    return res.json({ data: analysis, cached: true });
  }

  analysis = await AnalysisService.analyzeNetworkRange(cidr, deep);
  
  req.cache.set(cacheKey, analysis, 7200); // Cache for 2 hours
  res.json({ data: analysis, cached: false });
}));

// Get threat intelligence
router.get('/threat-intel/:ip', validateIP, asyncHandler(async (req, res) => {
  const { ip } = req.params;
  const cacheKey = `threat_intel_${ip}`;
  
  let intel = req.cache.get(cacheKey);
  if (intel) {
    return res.json({ data: intel, cached: true });
  }

  const hostData = await shodanService.getHostInfo(ip);
  intel = await AnalysisService.getThreatIntelligence(hostData);
  
  req.cache.set(cacheKey, intel, 3600);
  res.json({ data: intel, cached: false });
}));

// Compare hosts
router.post('/compare', asyncHandler(async (req, res) => {
  const { hosts } = req.body;
  
  if (!hosts || !Array.isArray(hosts) || hosts.length < 2 || hosts.length > 10) {
    return res.status(400).json({ error: 'Please provide 2-10 hosts to compare' });
  }

  const cacheKey = `compare_${hosts.sort().join('_')}`;
  let comparison = req.cache.get(cacheKey);
  
  if (comparison) {
    return res.json({ data: comparison, cached: true });
  }

  comparison = await AnalysisService.compareHosts(hosts);
  
  req.cache.set(cacheKey, comparison, 1800);
  res.json({ data: comparison, cached: false });
}));

module.exports = router;