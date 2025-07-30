const axios = require('axios');
const validator = require('validator');

class ShodanService {
  constructor() {
    this.apiKey = process.env.SHODAN_API_KEY;
    this.baseURL = 'https://api.shodan.io';
    
    if (!this.apiKey) {
      throw new Error('SHODAN_API_KEY environment variable is required');
    }
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: { key: this.apiKey, ...params },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error(`Shodan API Error: ${error.message}`);
      if (error.response) {
        throw new Error(`Shodan API: ${error.response.data.error || error.response.statusText}`);
      }
      throw new Error('Failed to connect to Shodan API');
    }
  }

  async getHostInfo(ip) {
    if (!validator.isIP(ip)) {
      throw new Error('Invalid IP address format');
    }
    return await this.makeRequest(`/shodan/host/${ip}`);
  }

  async searchHosts(query, options = {}) {
    const params = {
      query,
      page: options.page || 1,
      minify: options.minify || false
    };
    
    if (options.facets) params.facets = options.facets;
    return await this.makeRequest('/shodan/host/search', params);
  }

  async getHostCount(query, facets = null) {
    const params = { query };
    if (facets) params.facets = facets;
    return await this.makeRequest('/shodan/host/count', params);
  }

  async getDomainInfo(domain) {
    if (!validator.isFQDN(domain)) {
      throw new Error('Invalid domain format');
    }
    return await this.makeRequest(`/dns/domain/${domain}`);
  }

  async getApiInfo() {
    return await this.makeRequest('/api-info');
  }

  async searchExploits(query, options = {}) {
    const params = {
      query,
      page: options.page || 1
    };
    if (options.facets) params.facets = options.facets;
    return await this.makeRequest('/shodan/exploits/search', params);
  }

  async getServices() {
    return await this.makeRequest('/shodan/services');
  }

  async getPorts() {
    return await this.makeRequest('/shodan/ports');
  }

  async getProtocols() {
    return await this.makeRequest('/shodan/protocols');
  }

  async createAlert(name, ip, expires = null) {
    const params = { name, ip };
    if (expires) params.expires = expires;
    
    try {
      const response = await axios.post(`${this.baseURL}/shodan/alert`, params, {
        params: { key: this.apiKey },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error(`Shodan Alert Creation Error: ${error.message}`);
      throw new Error(`Failed to create alert: ${error.response?.data?.error || error.message}`);
    }
  }

  async getAlerts() {
    return await this.makeRequest('/shodan/alert/info');
  }

  async deleteAlert(id) {
    try {
      const response = await axios.delete(`${this.baseURL}/shodan/alert/${id}`, {
        params: { key: this.apiKey },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error(`Shodan Alert Deletion Error: ${error.message}`);
      throw new Error(`Failed to delete alert: ${error.response?.data?.error || error.message}`);
    }
  }

  async scanInternet(port, protocol = 'tcp') {
    const params = { port, protocol };
    
    try {
      const response = await axios.post(`${this.baseURL}/shodan/scan/internet`, params, {
        params: { key: this.apiKey },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error(`Shodan Scan Error: ${error.message}`);
      throw new Error(`Failed to initiate scan: ${error.response?.data?.error || error.message}`);
    }
  }

  async getScanStatus(id) {
    return await this.makeRequest(`/shodan/scan/${id}`);
  }
}

module.exports = new ShodanService();