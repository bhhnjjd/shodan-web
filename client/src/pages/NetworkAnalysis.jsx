import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  ServerIcon,
  GlobeAltIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

function NetworkAnalysis() {
  const [analysisType, setAnalysisType] = useState('subnet')
  const [target, setTarget] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState(null)

  // Mock network analysis data
  const mockSubnetData = {
    cidr: '192.168.1.0/24',
    totalHosts: 256,
    activeHosts: 89,
    services: {
      'HTTP': 34,
      'HTTPS': 28,
      'SSH': 45,
      'FTP': 12,
      'Telnet': 8,
      'SMTP': 15
    },
    vulnerabilities: {
      critical: 3,
      high: 12,
      medium: 28,
      low: 45
    },
    countries: {
      'United States': 45,
      'Canada': 23,
      'Germany': 12,
      'United Kingdom': 9
    },
    hostDetails: [
      {
        ip: '192.168.1.10',
        hostname: 'server01.local',
        os: 'Linux',
        ports: [22, 80, 443],
        vulns: 2,
        risk: 'medium'
      },
      {
        ip: '192.168.1.20',
        hostname: 'workstation01.local',
        os: 'Windows',
        ports: [135, 139, 445],
        vulns: 5,
        risk: 'high'
      },
      {
        ip: '192.168.1.30',
        hostname: 'database01.local',
        os: 'Linux',
        ports: [3306, 22],
        vulns: 1,
        risk: 'low'
      }
    ]
  }

  const mockPortScanData = [
    { port: 80, hosts: 12543, percentage: 45.2 },
    { port: 443, hosts: 10234, percentage: 36.8 },
    { port: 22, hosts: 8932, percentage: 32.1 },
    { port: 21, hosts: 5467, percentage: 19.7 },
    { port: 25, hosts: 3421, percentage: 12.3 },
    { port: 53, hosts: 2876, percentage: 10.4 }
  ]

  const mockGeoData = [
    { country: 'United States', hosts: 8432, lat: 39.8283, lng: -98.5795 },
    { country: 'China', hosts: 6234, lat: 35.8617, lng: 104.1954 },
    { country: 'Germany', hosts: 4532, lat: 51.1657, lng: 10.4515 },
    { country: 'Brazil', hosts: 3421, lat: -14.2350, lng: -51.9253 },
    { country: 'Russia', hosts: 2987, lat: 61.5240, lng: 105.3188 }
  ]

  const handleStartAnalysis = async () => {
    if (!target.trim()) return
    
    setIsScanning(true)
    // Simulate API call
    setTimeout(() => {
      setScanResults(mockSubnetData)
      setIsScanning(false)
    }, 3000)
  }

  const getRiskColor = (risk) => {
    const colors = {
      critical: 'text-red-700 bg-red-100',
      high: 'text-orange-700 bg-orange-100',
      medium: 'text-yellow-700 bg-yellow-100',
      low: 'text-green-700 bg-green-100'
    }
    return colors[risk] || 'text-gray-700 bg-gray-100'
  }

  return (
    <>
      <Helmet>
        <title>Network Analysis - Shodan Network Mapper</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Analysis</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive analysis of network ranges, ports, and geographic distribution
          </p>
        </div>

        {/* Analysis Controls */}
        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Analysis Type:</span>
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="analysisType"
                    value="subnet"
                    checked={analysisType === 'subnet'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="mr-2"
                  />
                  Subnet Analysis
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="analysisType"
                    value="port"
                    checked={analysisType === 'port'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="mr-2"
                  />
                  Port Analysis
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="analysisType"
                    value="geo"
                    checked={analysisType === 'geo'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="mr-2"
                  />
                  Geographic Analysis
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="input pl-10 w-full"
                    placeholder={
                      analysisType === 'subnet' ? 'Enter CIDR range (e.g., 192.168.1.0/24)' :
                      analysisType === 'port' ? 'Enter port number (e.g., 80)' :
                      'Enter country or region'
                    }
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleStartAnalysis}
                disabled={isScanning || !target.trim()}
                className="btn btn-primary disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isScanning && (
          <div className="card p-12 text-center">
            <LoadingSpinner size="large" />
            <div className="mt-4 text-lg font-medium text-gray-900">
              Analyzing {analysisType === 'subnet' ? 'network range' : analysisType === 'port' ? 'port distribution' : 'geographic data'}...
            </div>
            <div className="mt-2 text-sm text-gray-600">
              This may take a few moments depending on the scope
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {!isScanning && (
          <>
            {analysisType === 'subnet' && scanResults && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="card p-4">
                    <div className="text-2xl font-bold text-gray-900">{scanResults.activeHosts}</div>
                    <div className="text-sm text-gray-600">Active Hosts</div>
                    <div className="text-xs text-gray-500">
                      of {scanResults.totalHosts} total
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.keys(scanResults.services).length}
                    </div>
                    <div className="text-sm text-gray-600">Services Found</div>
                  </div>
                  <div className="card p-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.values(scanResults.vulnerabilities).reduce((a, b) => a + b, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Vulnerabilities</div>
                  </div>
                  <div className="card p-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((scanResults.activeHosts / scanResults.totalHosts) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Network Utilization</div>
                  </div>
                </div>

                {/* Service Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Service Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(scanResults.services).map(([service, count]) => ({ service, count }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="service" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vulnerability Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(scanResults.vulnerabilities).map(([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              severity === 'critical' ? 'bg-red-500' :
                              severity === 'high' ? 'bg-orange-500' :
                              severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-900 capitalize">{severity}</span>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Host Details */}
                <div className="card p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Host Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Host
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            OS
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Open Ports
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vulnerabilities
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Level
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scanResults.hostDetails.map((host) => (
                          <tr key={host.ip} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{host.ip}</div>
                                {host.hostname && (
                                  <div className="text-sm text-gray-500">{host.hostname}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {host.os}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {host.ports.map((port) => (
                                  <span key={port} className="badge badge-blue text-xs">
                                    {port}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {host.vulns}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`badge ${getRiskColor(host.risk)}`}>
                                {host.risk}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {analysisType === 'port' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Port Distribution Analysis</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockPortScanData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="port" type="category" width={60} />
                        <Tooltip />
                        <Bar dataKey="hosts" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockPortScanData.slice(0, 3).map((port) => (
                    <div key={port.port} className="card p-4">
                      <div className="text-2xl font-bold text-gray-900">Port {port.port}</div>
                      <div className="text-sm text-gray-600">{port.hosts.toLocaleString()} hosts</div>
                      <div className="text-xs text-gray-500">{port.percentage}% coverage</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisType === 'geo' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockGeoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hosts" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {mockGeoData.map((country) => (
                    <div key={country.country} className="card p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <GlobeAltIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{country.hosts.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{country.country}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Default State */}
        {!isScanning && !scanResults && (
          <div className="card p-12 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Start Network Analysis</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter a target and click "Start Analysis" to begin comprehensive network reconnaissance.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div>• Subnet Analysis: Discover all hosts in a network range</div>
              <div>• Port Analysis: Analyze service distribution across the internet</div>
              <div>• Geographic Analysis: View global distribution of hosts and services</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default NetworkAnalysis