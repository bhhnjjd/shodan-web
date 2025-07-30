import { useState } from 'react'
import { useQuery } from 'react-query'
import { Helmet } from 'react-helmet-async'
import { 
  ShieldExclamationIcon,
  FunnelIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

function Vulnerabilities() {
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Mock vulnerability data - in production this would come from API
  const mockVulnData = {
    total: 2847,
    distribution: {
      critical: 47,
      high: 284,
      medium: 892,
      low: 624,
      info: 1000
    },
    recent: [
      {
        cve: 'CVE-2023-12345',
        severity: 'critical',
        cvss: 9.8,
        title: 'Remote Code Execution in Apache HTTP Server',
        affectedHosts: 142,
        published: '2023-12-15',
        description: 'A critical vulnerability allowing remote code execution through malformed HTTP requests.'
      },
      {
        cve: 'CVE-2023-12344',
        severity: 'high',
        cvss: 8.1,
        title: 'SQL Injection in MySQL Authentication',
        affectedHosts: 89,
        published: '2023-12-10',
        description: 'Authentication bypass vulnerability in MySQL server allowing unauthorized access.'
      },
      {
        cve: 'CVE-2023-12343',
        severity: 'high',
        cvss: 7.5,
        title: 'Buffer Overflow in OpenSSH',
        affectedHosts: 234,
        published: '2023-12-08',
        description: 'Buffer overflow vulnerability in OpenSSH server leading to potential code execution.'
      },
      {
        cve: 'CVE-2023-12342',
        severity: 'medium',
        cvss: 6.5,
        title: 'Information Disclosure in Nginx',
        affectedHosts: 456,
        published: '2023-12-05',
        description: 'Information disclosure vulnerability exposing sensitive configuration data.'
      }
    ],
    trends: [
      { month: 'Jan', critical: 42, high: 156, medium: 234, low: 178 },
      { month: 'Feb', critical: 38, high: 189, medium: 267, low: 198 },
      { month: 'Mar', critical: 51, high: 203, medium: 298, low: 234 },
      { month: 'Apr', critical: 45, high: 178, medium: 334, low: 267 },
      { month: 'May', critical: 49, high: 234, medium: 367, low: 289 },
      { month: 'Jun', critical: 47, high: 284, medium: 392, low: 324 }
    ],
    topCVEs: [
      { cve: 'CVE-2023-12345', hosts: 142 },
      { cve: 'CVE-2023-12344', hosts: 89 },
      { cve: 'CVE-2023-12343', hosts: 234 },
      { cve: 'CVE-2023-12342', hosts: 456 },
      { cve: 'CVE-2023-12341', hosts: 67 }
    ]
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      low: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      info: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    }
    return colors[severity] || colors.info
  }

  const pieData = [
    { name: 'Critical', value: mockVulnData.distribution.critical, color: '#ef4444' },
    { name: 'High', value: mockVulnData.distribution.high, color: '#f97316' },
    { name: 'Medium', value: mockVulnData.distribution.medium, color: '#eab308' },
    { name: 'Low', value: mockVulnData.distribution.low, color: '#3b82f6' },
    { name: 'Info', value: mockVulnData.distribution.info, color: '#6b7280' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <>
      <Helmet>
        <title>Vulnerabilities - Shodan Network Mapper</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vulnerability Analysis</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor and analyze security vulnerabilities across your network
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(mockVulnData.distribution).map(([severity, count]) => {
            const colors = getSeverityColor(severity)
            return (
              <div key={severity} className={`card p-4 ${colors.border} border-l-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className={`text-sm font-medium capitalize ${colors.text}`}>
                      {severity}
                    </div>
                  </div>
                  <ShieldExclamationIcon className={`h-8 w-8 ${colors.text}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vulnerability Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Severity Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vulnerability Trends */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockVulnData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                  <Bar dataKey="high" stackId="a" fill="#f97316" />
                  <Bar dataKey="medium" stackId="a" fill="#eab308" />
                  <Bar dataKey="low" stackId="a" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search CVEs, keywords, or products..."
                  className="input pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  className="select"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Vulnerabilities */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Vulnerabilities</h3>
            <button className="btn btn-secondary text-sm">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {mockVulnData.recent.map((vuln) => {
              const colors = getSeverityColor(vuln.severity)
              return (
                <div key={vuln.cve} className={`border rounded-lg p-4 ${colors.border} ${colors.bg}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono font-medium text-gray-900">{vuln.cve}</span>
                        <span className={`badge ${colors.bg} ${colors.text}`}>
                          {vuln.severity.toUpperCase()} ({vuln.cvss})
                        </span>
                        <span className="text-sm text-gray-600">
                          {vuln.affectedHosts} affected hosts
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2">{vuln.title}</h4>
                      <p className="text-sm text-gray-700 mb-3">{vuln.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Published: {new Date(vuln.published).toLocaleDateString()}</span>
                        <button className="text-blue-600 hover:text-blue-800">
                          View Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          Search Affected Hosts
                        </button>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">{vuln.affectedHosts}</div>
                      <div className="text-sm text-gray-600">hosts</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top CVEs by Host Count */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Widespread Vulnerabilities</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="horizontal" data={mockVulnData.topCVEs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="cve" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="hosts" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )
}

export default Vulnerabilities