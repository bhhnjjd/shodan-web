class ApiClient {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Shodan API methods
  async getHostInfo(ip) {
    return this.request(`/shodan/host/${ip}`);
  }

  async searchHosts(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      ...options,
    });
    return this.request(`/shodan/search?${params}`);
  }

  async getHostCount(query, facets = null) {
    const params = new URLSearchParams({ q: query });
    if (facets) params.append('facets', facets);
    return this.request(`/shodan/count?${params}`);
  }

  async getDomainInfo(domain) {
    return this.request(`/shodan/domain/${domain}`);
  }

  async getApiInfo() {
    return this.request('/shodan/api-info');
  }

  async searchExploits(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      ...options,
    });
    return this.request(`/shodan/exploits?${params}`);
  }

  async getServices() {
    return this.request('/shodan/services');
  }

  async getPorts() {
    return this.request('/shodan/ports');
  }

  async getProtocols() {
    return this.request('/shodan/protocols');
  }

  // Analysis API methods
  async analyzeVulnerabilities(ip) {
    return this.request(`/analysis/vulnerabilities/${ip}`);
  }

  async analyzeSecurityPosture(ip) {
    return this.request(`/analysis/security/${ip}`);
  }

  async generateReport(ip, format = 'json') {
    const params = new URLSearchParams({ format });
    return this.request(`/analysis/report/${ip}?${params}`);
  }

  async analyzeNetworkRange(cidr, deep = false) {
    return this.request('/analysis/network-scan', {
      method: 'POST',
      body: JSON.stringify({ cidr, deep }),
    });
  }

  async getThreatIntelligence(ip) {
    return this.request(`/analysis/threat-intel/${ip}`);
  }

  async compareHosts(hosts) {
    return this.request('/analysis/compare', {
      method: 'POST',
      body: JSON.stringify({ hosts }),
    });
  }

  // Alerts API methods
  async getAlerts() {
    return this.request('/alerts');
  }

  async createAlert(name, ip, expires = null) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ name, ip, expires }),
    });
  }

  async deleteAlert(id) {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  async triggerScan(port, protocol = 'tcp') {
    return this.request('/alerts/scan', {
      method: 'POST',
      body: JSON.stringify({ port, protocol }),
    });
  }

  async getScanStatus(id) {
    return this.request(`/alerts/scan/${id}`);
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }
}

export default new ApiClient();