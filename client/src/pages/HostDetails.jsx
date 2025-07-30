import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Helmet } from 'react-helmet-async'
import { 
  ShieldExclamationIcon,
  ServerIcon,
  GlobeAltIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

function HostDetails() {
  const { ip } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: hostData, isLoading: hostLoading, error: hostError } = useQuery(
    ['host', ip],
    () => api.getHostInfo(ip),
    { enabled: !!ip }
  )

  const { data: vulnData, isLoading: vulnLoading } = useQuery(
    ['vulnerabilities', ip],
    () => api.analyzeVulnerabilities(ip),
    { enabled: !!ip }
  )

  const { data: securityData, isLoading: securityLoading } = useQuery(
    ['security', ip],
    () => api.analyzeSecurityPosture(ip),
    { enabled: !!ip }
  )

  const { data: threatData, isLoading: threatLoading } = useQuery(
    ['threat-intel', ip],
    () => api.getThreatIntelligence(ip),
    { enabled: !!ip }
  )

  if (hostLoading) {
    return <LoadingSpinner />
  }

  if (hostError) {
    return <ErrorMessage error={hostError} title="Failed to load host information" />
  }

  const host = hostData?.data
  if (!host) {
    return <ErrorMessage error="Host not found" />
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ServerIcon },
    { id: 'services', name: 'Services', icon: ChartBarIcon },
    { id: 'vulnerabilities', name: 'Vulnerabilities', icon: ShieldExclamationIcon },
    { id: 'security', name: 'Security', icon: ExclamationTriangleIcon },
    { id: 'threat-intel', name: 'Threat Intel', icon: TagIcon },
  ]

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-700 bg-red-100',
      high: 'text-orange-700 bg-orange-100',
      medium: 'text-yellow-700 bg-yellow-100',
      low: 'text-blue-700 bg-blue-100'
    }
    return colors[severity] || 'text-gray-700 bg-gray-100'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <Helmet>
        <title>{ip} - Host Details - Shodan Network Mapper</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <ServerIcon className="h-8 w-8 text-gray-400" />
              <h1 className="text-3xl font-bold text-gray-900">{ip}</h1>
              {host.hostnames && host.hostnames.length > 0 && (
                <span className="text-lg text-gray-600">({host.hostnames[0]})</span>
              )}
            </div>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              {host.org && (
                <div className="flex items-center space-x-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>{host.org}</span>
                </div>
              )}
              {host.country_name && (
                <div className="flex items-center space-x-1">
                  <GlobeAltIcon className="h-4 w-4" />
                  <span>{host.city}, {host.country_name}</span>
                </div>
              )}
              {host.last_update && (
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>Last seen: {formatDate(host.last_update)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="btn btn-secondary">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <Link to={`/search?q=${ip}`} className="btn btn-primary">
              Search Similar
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">{host.ports?.length || 0}</div>
            <div className="text-sm text-gray-600">Open Ports</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {vulnData?.data?.totalVulnerabilities || 0}
            </div>
            <div className="text-sm text-gray-600">Vulnerabilities</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {securityData?.data?.securityScore || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Security Score</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {threatData?.data?.reputation || 'Unknown'}
            </div>
            <div className="text-sm text-gray-600 capitalize">Reputation</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">IP Address</dt>
                    <dd className="text-sm font-medium text-gray-900">{host.ip_str}</dd>
                  </div>
                  {host.hostnames && host.hostnames.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Hostnames</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {host.hostnames.join(', ')}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Organization</dt>
                    <dd className="text-sm font-medium text-gray-900">{host.org || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">ISP</dt>
                    <dd className="text-sm font-medium text-gray-900">{host.isp || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">ASN</dt>
                    <dd className="text-sm font-medium text-gray-900">{host.asn || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Location</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {host.city}, {host.region_code}, {host.country_name}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Open Ports */}
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Open Ports</h3>
                {host.ports && host.ports.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {host.ports.map((port) => (
                      <span key={port} className="badge badge-blue text-center">
                        {port}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No open ports detected</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              {host.data && host.data.length > 0 ? (
                <div className="space-y-4">
                  {host.data.map((service, index) => (
                    <div key={index} className="card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="badge badge-blue">Port {service.port}</span>
                          <span className="badge badge-gray">{service.transport?.toUpperCase()}</span>
                          {service.product && (
                            <span className="font-medium text-gray-900">{service.product}</span>
                          )}
                          {service.version && (
                            <span className="text-sm text-gray-600">v{service.version}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(service.timestamp)}
                        </div>
                      </div>
                      
                      {service.banner && (
                        <div className="bg-gray-50 rounded p-3">
                          <div className="text-xs text-gray-500 mb-2">Service Banner:</div>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                            {service.banner}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-500">No service information available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vulnerabilities' && (
            <div className="space-y-6">
              {vulnLoading ? (
                <LoadingSpinner />
              ) : vulnData?.data ? (
                <div className="space-y-6">
                  {/* Vulnerability Summary */}
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(vulnData.data.riskDistribution).map(([severity, count]) => (
                      <div key={severity} className="card p-4 text-center">
                        <div className={`text-2xl font-bold ${getSeverityColor(severity).split(' ')[0]}`}>
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{severity}</div>
                      </div>
                    ))}
                  </div>

                  {/* Vulnerability List */}
                  {vulnData.data.vulnerabilities.length > 0 ? (
                    <div className="space-y-4">
                      {vulnData.data.vulnerabilities.map((vuln) => (
                        <div key={vuln.cve} className="card p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-mono font-medium text-gray-900">{vuln.cve}</span>
                              <span className={`badge ${getSeverityColor(vuln.severity)}`}>
                                {vuln.severity} ({vuln.cvss})
                              </span>
                              {vuln.verified && (
                                <span className="badge badge-green">Verified</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{vuln.summary}</p>
                          {vuln.references && vuln.references.length > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-500">References: </span>
                              {vuln.references.slice(0, 3).map((ref, index) => (
                                <a
                                  key={index}
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 mr-3"
                                >
                                  [{index + 1}]
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-6 text-center">
                      <p className="text-green-600 font-medium">No vulnerabilities detected</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-500">Vulnerability analysis not available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {securityLoading ? (
                <LoadingSpinner />
              ) : securityData?.data ? (
                <div className="space-y-6">
                  {/* Security Score */}
                  <div className="card p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security Assessment</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {securityData.data.securityScore}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          Grade {securityData.data.securityGrade}
                        </div>
                        <div className="text-sm text-gray-600">Security Grade</div>
                      </div>
                    </div>
                  </div>

                  {/* Security Issues */}
                  {securityData.data.issues.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Security Issues</h3>
                      <div className="space-y-3">
                        {securityData.data.issues.map((issue, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                            <ExclamationTriangleIcon className={`h-5 w-5 mt-0.5 ${
                              issue.severity === 'high' ? 'text-red-500' :
                              issue.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{issue.description}</span>
                                <span className={`badge ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity}
                                </span>
                              </div>
                              {issue.port && (
                                <div className="text-sm text-gray-600">Port: {issue.port}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {securityData.data.recommendations.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                      <ul className="space-y-2">
                        {securityData.data.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-500">Security analysis not available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'threat-intel' && (
            <div className="space-y-6">
              {threatLoading ? (
                <LoadingSpinner />
              ) : threatData?.data ? (
                <div className="space-y-6">
                  {/* Threat Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{threatData.data.threatScore}</div>
                      <div className="text-sm text-gray-600">Threat Score</div>
                    </div>
                    <div className="card p-4 text-center">
                      <div className={`text-2xl font-bold capitalize ${
                        threatData.data.reputation === 'malicious' ? 'text-red-600' :
                        threatData.data.reputation === 'suspicious' ? 'text-yellow-600' :
                        threatData.data.reputation === 'clean' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {threatData.data.reputation}
                      </div>
                      <div className="text-sm text-gray-600">Reputation</div>
                    </div>
                    <div className="card p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{threatData.data.indicators.length}</div>
                      <div className="text-sm text-gray-600">Indicators</div>
                    </div>
                  </div>

                  {/* Threat Indicators */}
                  {threatData.data.indicators.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Indicators</h3>
                      <div className="space-y-3">
                        {threatData.data.indicators.map((indicator, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <TagIcon className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{indicator.value}</span>
                                <span className={`badge ${getSeverityColor(indicator.severity)}`}>
                                  {indicator.type}
                                </span>
                              </div>
                              {indicator.port && (
                                <div className="text-sm text-gray-600">Port: {indicator.port}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-500">Threat intelligence not available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HostDetails