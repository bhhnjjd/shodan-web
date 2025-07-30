import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  DocumentTextIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon,
  ServerIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportType, setReportType] = useState('all')
  const [dateRange, setDateRange] = useState('30')

  // Mock reports data
  const mockReports = [
    {
      id: '1',
      title: 'Weekly Security Assessment',
      type: 'security',
      date: '2023-12-15',
      size: '2.4 MB',
      hosts: 1247,
      vulnerabilities: 89,
      description: 'Comprehensive security analysis of production network infrastructure',
      status: 'completed',
      format: 'PDF'
    },
    {
      id: '2',
      title: 'Network Discovery Report',
      type: 'discovery',
      date: '2023-12-10',
      size: '1.8 MB',
      hosts: 892,
      vulnerabilities: 34,
      description: 'Complete network mapping and service enumeration report',
      status: 'completed',
      format: 'HTML'
    },
    {
      id: '3',
      title: 'Vulnerability Trend Analysis',
      type: 'vulnerability',
      date: '2023-12-08',
      size: '3.1 MB',
      hosts: 2156,
      vulnerabilities: 234,
      description: 'Monthly vulnerability trend analysis and risk assessment',
      status: 'completed',
      format: 'PDF'
    },
    {
      id: '4',
      title: 'Compliance Audit Report',
      type: 'compliance',
      date: '2023-12-05',
      size: '4.2 MB',
      hosts: 567,
      vulnerabilities: 12,
      description: 'SOC 2 compliance audit and security posture assessment',
      status: 'completed',
      format: 'PDF'
    },
    {
      id: '5',
      title: 'Executive Summary - Q4 2023',
      type: 'executive',
      date: '2023-12-01',
      size: '892 KB',
      hosts: 3421,
      vulnerabilities: 156,
      description: 'High-level security overview for executive leadership',
      status: 'completed',
      format: 'PDF'
    }
  ]

  const reportTypes = [
    { value: 'all', label: 'All Reports', icon: DocumentTextIcon },
    { value: 'security', label: 'Security', icon: ShieldExclamationIcon },
    { value: 'discovery', label: 'Discovery', icon: ServerIcon },
    { value: 'vulnerability', label: 'Vulnerability', icon: ChartBarIcon },
    { value: 'compliance', label: 'Compliance', icon: DocumentTextIcon },
    { value: 'executive', label: 'Executive', icon: DocumentTextIcon }
  ]

  const filteredReports = reportType === 'all' 
    ? mockReports 
    : mockReports.filter(report => report.type === reportType)

  const getReportIcon = (type) => {
    const iconMap = {
      security: ShieldExclamationIcon,
      discovery: ServerIcon,
      vulnerability: ChartBarIcon,
      compliance: DocumentTextIcon,
      executive: DocumentTextIcon
    }
    return iconMap[type] || DocumentTextIcon
  }

  const getReportColor = (type) => {
    const colorMap = {
      security: 'text-red-600 bg-red-100',
      discovery: 'text-blue-600 bg-blue-100',
      vulnerability: 'text-orange-600 bg-orange-100',
      compliance: 'text-green-600 bg-green-100',
      executive: 'text-purple-600 bg-purple-100'
    }
    return colorMap[type] || 'text-gray-600 bg-gray-100'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateNewReport = () => {
    // In a real app, this would trigger report generation
    alert('Report generation started. You will be notified when complete.')
  }

  return (
    <>
      <Helmet>
        <title>Reports - Shodan Network Mapper</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Reports</h1>
            <p className="mt-2 text-sm text-gray-700">
              Generate and manage comprehensive security reports and assessments
            </p>
          </div>
          <button onClick={generateNewReport} className="btn btn-primary">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">{mockReports.length}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {mockReports.reduce((sum, report) => sum + report.hosts, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Hosts Analyzed</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {mockReports.reduce((sum, report) => sum + report.vulnerabilities, 0)}
            </div>
            <div className="text-sm text-gray-600">Vulnerabilities Found</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(mockReports.reduce((sum, report) => sum + parseFloat(report.size), 0) * 100) / 100} MB
            </div>
            <div className="text-sm text-gray-600">Total Size</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by type:</span>
              <div className="flex flex-wrap gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value)}
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      reportType === type.value
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="h-4 w-4 mr-1" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Date range:</span>
              <select
                className="select text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Reports ({filteredReports.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const ReportIcon = getReportIcon(report.type)
              const colorClass = getReportColor(report.type)
              
              return (
                <div key={report.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <ReportIcon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                          <span className={`badge ${colorClass}`}>
                            {report.type}
                          </span>
                          <span className="badge badge-gray">{report.format}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(report.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ServerIcon className="h-4 w-4" />
                            <span>{report.hosts.toLocaleString()} hosts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ShieldExclamationIcon className="h-4 w-4" />
                            <span>{report.vulnerabilities} vulns</span>
                          </div>
                          <div>
                            <span className="font-medium">{report.size}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="btn btn-secondary text-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Preview
                      </button>
                      <button className="btn btn-primary text-sm">
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {filteredReports.length === 0 && (
              <div className="p-6 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or generate a new report.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report Templates */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Report Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Security Assessment',
                description: 'Comprehensive security analysis with vulnerability details',
                type: 'security',
                estimatedTime: '15-30 min'
              },
              {
                name: 'Network Discovery',
                description: 'Complete network mapping and service enumeration',
                type: 'discovery',
                estimatedTime: '10-20 min'
              },
              {
                name: 'Compliance Audit',
                description: 'Regulatory compliance assessment and recommendations',
                type: 'compliance',
                estimatedTime: '20-40 min'
              },
              {
                name: 'Executive Summary',
                description: 'High-level overview for management and stakeholders',
                type: 'executive',
                estimatedTime: '5-10 min'
              },
              {
                name: 'Threat Intelligence',
                description: 'Threat landscape analysis and risk assessment',
                type: 'threat',
                estimatedTime: '25-45 min'
              },
              {
                name: 'Custom Report',
                description: 'Configurable report with custom parameters',
                type: 'custom',
                estimatedTime: 'Variable'
              }
            ].map((template) => (
              <div key={template.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <span className={`badge ${getReportColor(template.type)}`}>
                    {template.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Est. {template.estimatedTime}
                  </span>
                  <button className="btn btn-secondary text-sm">
                    Generate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Report Preview</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h4 className="text-xl font-medium text-gray-900 mb-2">
                  {selectedReport.title}
                </h4>
                <p className="text-gray-600 mb-4">{selectedReport.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-6">
                  <div>
                    <div className="font-medium">Date</div>
                    <div>{formatDate(selectedReport.date)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Hosts</div>
                    <div>{selectedReport.hosts.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-medium">Vulnerabilities</div>
                    <div>{selectedReport.vulnerabilities}</div>
                  </div>
                  <div>
                    <div className="font-medium">Size</div>
                    <div>{selectedReport.size}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Full report preview will be available after download
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Reports