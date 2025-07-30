const shodanService = require('./shodanService');
const moment = require('moment');

class AnalysisService {
  // Analyze vulnerabilities from host data
  static analyzeVulnerabilities(hostData) {
    const vulnerabilities = [];
    const riskScore = { low: 0, medium: 0, high: 0, critical: 0 };
    
    if (hostData.vulns) {
      for (const [cve, details] of Object.entries(hostData.vulns)) {
        const vuln = {
          cve,
          cvss: details.cvss || 0,
          summary: details.summary || 'No description available',
          verified: details.verified || false,
          references: details.references || []
        };
        
        // Categorize by CVSS score
        if (vuln.cvss >= 9.0) {
          vuln.severity = 'critical';
          riskScore.critical++;
        } else if (vuln.cvss >= 7.0) {
          vuln.severity = 'high';
          riskScore.high++;
        } else if (vuln.cvss >= 4.0) {
          vuln.severity = 'medium';
          riskScore.medium++;
        } else {
          vuln.severity = 'low';
          riskScore.low++;
        }
        
        vulnerabilities.push(vuln);
      }
    }

    // Calculate overall risk score
    const totalScore = (riskScore.critical * 10) + (riskScore.high * 7) + 
                      (riskScore.medium * 4) + (riskScore.low * 1);
    
    return {
      ip: hostData.ip_str,
      hostname: hostData.hostnames || [],
      totalVulnerabilities: vulnerabilities.length,
      vulnerabilities: vulnerabilities.sort((a, b) => b.cvss - a.cvss),
      riskDistribution: riskScore,
      overallRiskScore: totalScore,
      riskLevel: this.calculateRiskLevel(totalScore),
      lastScan: hostData.last_update,
      ports: hostData.ports || [],
      services: (hostData.data || []).map(service => ({
        port: service.port,
        protocol: service.transport,
        product: service.product,
        version: service.version,
        banner: service.banner
      }))
    };
  }

  // Analyze security posture
  static analyzeSecurityPosture(hostData) {
    const issues = [];
    const recommendations = [];
    let securityScore = 100;

    // Check for common security issues
    if (hostData.data) {
      hostData.data.forEach(service => {
        // Check for unencrypted services
        if (['telnet', 'ftp', 'http'].includes(service.product?.toLowerCase())) {
          issues.push({
            type: 'unencrypted_service',
            severity: 'medium',
            port: service.port,
            service: service.product,
            description: `Unencrypted ${service.product} service detected`
          });
          securityScore -= 10;
        }

        // Check for default credentials
        if (service.banner && 
            (service.banner.includes('admin:admin') || 
             service.banner.includes('default password'))) {
          issues.push({
            type: 'default_credentials',
            severity: 'high',
            port: service.port,
            description: 'Potential default credentials detected'
          });
          securityScore -= 20;
        }

        // Check for outdated software
        if (service.version && this.isOutdatedVersion(service.product, service.version)) {
          issues.push({
            type: 'outdated_software',
            severity: 'medium',
            port: service.port,
            product: service.product,
            version: service.version,
            description: `Potentially outdated ${service.product} version`
          });
          securityScore -= 15;
        }
      });
    }

    // Generate recommendations
    if (issues.some(i => i.type === 'unencrypted_service')) {
      recommendations.push('Implement SSL/TLS encryption for all services');
    }
    if (issues.some(i => i.type === 'default_credentials')) {
      recommendations.push('Change all default passwords and usernames');
    }
    if (issues.some(i => i.type === 'outdated_software')) {
      recommendations.push('Update all software to latest versions');
    }

    return {
      ip: hostData.ip_str,
      securityScore: Math.max(0, securityScore),
      securityGrade: this.calculateSecurityGrade(securityScore),
      issues,
      recommendations,
      openPorts: hostData.ports?.length || 0,
      lastUpdate: hostData.last_update,
      organization: hostData.org,
      country: hostData.country_name,
      city: hostData.city
    };
  }

  // Generate comprehensive report
  static generateReport(hostData, format = 'json') {
    const vulnerabilityAnalysis = this.analyzeVulnerabilities(hostData);
    const securityAnalysis = this.analyzeSecurityPosture(hostData);
    
    const report = {
      generatedAt: new Date().toISOString(),
      target: {
        ip: hostData.ip_str,
        hostnames: hostData.hostnames || [],
        organization: hostData.org,
        isp: hostData.isp,
        location: {
          country: hostData.country_name,
          city: hostData.city,
          region: hostData.region_code,
          coordinates: [hostData.longitude, hostData.latitude]
        }
      },
      summary: {
        totalPorts: hostData.ports?.length || 0,
        totalVulnerabilities: vulnerabilityAnalysis.totalVulnerabilities,
        riskLevel: vulnerabilityAnalysis.riskLevel,
        securityScore: securityAnalysis.securityScore,
        lastScan: hostData.last_update
      },
      vulnerabilities: vulnerabilityAnalysis,
      security: securityAnalysis,
      services: hostData.data?.map(service => ({
        port: service.port,
        protocol: service.transport,
        product: service.product,
        version: service.version,
        banner: service.banner?.substring(0, 200) + '...',
        timestamp: service.timestamp
      })) || [],
      tags: hostData.tags || []
    };

    if (format === 'csv') {
      return this.convertToCSV(report);
    } else if (format === 'xml') {
      return this.convertToXML(report);
    }
    
    return report;
  }

  // Analyze network range
  static async analyzeNetworkRange(cidr, deep = false) {
    try {
      const query = `net:${cidr}`;
      const searchResults = await shodanService.searchHosts(query, { page: 1 });
      
      const analysis = {
        cidr,
        totalHosts: searchResults.total || 0,
        scannedHosts: searchResults.matches?.length || 0,
        hosts: [],
        commonServices: {},
        vulnerabilitySummary: { critical: 0, high: 0, medium: 0, low: 0 },
        topCountries: {},
        topOrganizations: {}
      };

      if (searchResults.matches) {
        searchResults.matches.forEach(host => {
          const hostInfo = {
            ip: host.ip_str,
            ports: host.port ? [host.port] : [],
            organization: host.org,
            country: host.location?.country_name,
            vulns: Object.keys(host.vulns || {}).length
          };

          analysis.hosts.push(hostInfo);

          // Count services
          if (host.product) {
            analysis.commonServices[host.product] = 
              (analysis.commonServices[host.product] || 0) + 1;
          }

          // Count vulnerabilities by severity
          if (host.vulns) {
            Object.values(host.vulns).forEach(vuln => {
              const cvss = vuln.cvss || 0;
              if (cvss >= 9.0) analysis.vulnerabilitySummary.critical++;
              else if (cvss >= 7.0) analysis.vulnerabilitySummary.high++;
              else if (cvss >= 4.0) analysis.vulnerabilitySummary.medium++;
              else analysis.vulnerabilitySummary.low++;
            });
          }

          // Count countries and organizations
          if (host.location?.country_name) {
            analysis.topCountries[host.location.country_name] = 
              (analysis.topCountries[host.location.country_name] || 0) + 1;
          }
          if (host.org) {
            analysis.topOrganizations[host.org] = 
              (analysis.topOrganizations[host.org] || 0) + 1;
          }
        });
      }

      return analysis;
    } catch (error) {
      throw new Error(`Network analysis failed: ${error.message}`);
    }
  }

  // Get threat intelligence
  static async getThreatIntelligence(hostData) {
    const intel = {
      ip: hostData.ip_str,
      threatScore: 0,
      indicators: [],
      malwareHistory: [],
      botnetActivity: false,
      reputation: 'unknown'
    };

    // Check tags for threat indicators
    if (hostData.tags) {
      const threatTags = ['malware', 'botnet', 'compromised', 'suspicious', 'honeypot'];
      hostData.tags.forEach(tag => {
        if (threatTags.includes(tag.toLowerCase())) {
          intel.indicators.push({
            type: 'tag',
            value: tag,
            severity: 'high'
          });
          intel.threatScore += 25;
        }
      });
    }

    // Check for suspicious services
    if (hostData.data) {
      const suspiciousServices = ['tor', 'proxy', 'vpn'];
      hostData.data.forEach(service => {
        if (service.product && 
            suspiciousServices.some(s => service.product.toLowerCase().includes(s))) {
          intel.indicators.push({
            type: 'service',
            value: service.product,
            port: service.port,
            severity: 'medium'
          });
          intel.threatScore += 10;
        }
      });
    }

    // Determine reputation based on threat score
    if (intel.threatScore >= 50) {
      intel.reputation = 'malicious';
    } else if (intel.threatScore >= 25) {
      intel.reputation = 'suspicious';
    } else if (intel.threatScore > 0) {
      intel.reputation = 'caution';
    } else {
      intel.reputation = 'clean';
    }

    return intel;
  }

  // Compare multiple hosts
  static async compareHosts(hostIPs) {
    const hostData = [];
    
    for (const ip of hostIPs) {
      try {
        const data = await shodanService.getHostInfo(ip);
        hostData.push(data);
      } catch (error) {
        hostData.push({ ip_str: ip, error: error.message });
      }
    }

    const comparison = {
      hosts: hostData.map(host => ({
        ip: host.ip_str,
        organization: host.org,
        country: host.country_name,
        openPorts: host.ports?.length || 0,
        vulnerabilities: Object.keys(host.vulns || {}).length,
        lastUpdate: host.last_update,
        error: host.error
      })),
      commonPorts: this.findCommonPorts(hostData),
      commonVulnerabilities: this.findCommonVulnerabilities(hostData),
      riskComparison: hostData.map(host => ({
        ip: host.ip_str,
        riskScore: this.calculateHostRiskScore(host)
      }))
    };

    return comparison;
  }

  // Helper methods
  static calculateRiskLevel(score) {
    if (score >= 50) return 'critical';
    if (score >= 30) return 'high';
    if (score >= 15) return 'medium';
    return 'low';
  }

  static calculateSecurityGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  static isOutdatedVersion(product, version) {
    // Simplified version check - in production, use a vulnerability database
    const commonOutdated = {
      'apache': '2.4.0',
      'nginx': '1.18.0',
      'openssh': '8.0'
    };
    
    return commonOutdated[product?.toLowerCase()] && 
           version < commonOutdated[product.toLowerCase()];
  }

  static calculateHostRiskScore(host) {
    let score = 0;
    
    // Vulnerabilities
    if (host.vulns) {
      Object.values(host.vulns).forEach(vuln => {
        const cvss = vuln.cvss || 0;
        if (cvss >= 9.0) score += 10;
        else if (cvss >= 7.0) score += 7;
        else if (cvss >= 4.0) score += 4;
        else score += 1;
      });
    }
    
    // Open ports
    score += (host.ports?.length || 0) * 2;
    
    return score;
  }

  static findCommonPorts(hostData) {
    const portCounts = {};
    
    hostData.forEach(host => {
      if (host.ports) {
        host.ports.forEach(port => {
          portCounts[port] = (portCounts[port] || 0) + 1;
        });
      }
    });
    
    return Object.entries(portCounts)
      .filter(([port, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
  }

  static findCommonVulnerabilities(hostData) {
    const vulnCounts = {};
    
    hostData.forEach(host => {
      if (host.vulns) {
        Object.keys(host.vulns).forEach(cve => {
          vulnCounts[cve] = (vulnCounts[cve] || 0) + 1;
        });
      }
    });
    
    return Object.entries(vulnCounts)
      .filter(([cve, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
  }

  static convertToCSV(report) {
    // Simplified CSV conversion - implement full conversion as needed
    const headers = ['IP', 'Organization', 'Country', 'Open Ports', 'Vulnerabilities', 'Risk Level'];
    const rows = [headers.join(',')];
    
    rows.push([
      report.target.ip,
      report.target.organization || '',
      report.target.location.country || '',
      report.summary.totalPorts,
      report.summary.totalVulnerabilities,
      report.summary.riskLevel
    ].join(','));
    
    return rows.join('\n');
  }

  static convertToXML(report) {
    // Simplified XML conversion - implement full conversion as needed
    return `<?xml version="1.0" encoding="UTF-8"?>
<report>
  <target>
    <ip>${report.target.ip}</ip>
    <organization>${report.target.organization || ''}</organization>
    <country>${report.target.location.country || ''}</country>
  </target>
  <summary>
    <totalPorts>${report.summary.totalPorts}</totalPorts>
    <totalVulnerabilities>${report.summary.totalVulnerabilities}</totalVulnerabilities>
    <riskLevel>${report.summary.riskLevel}</riskLevel>
  </summary>
</report>`;
  }
}

module.exports = AnalysisService;