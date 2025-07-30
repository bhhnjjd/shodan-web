import { useState } from 'react'
import { useQuery } from 'react-query'
import { Helmet } from 'react-helmet-async'
import { 
  ChartBarIcon, 
  ShieldExclamationIcon, 
  ServerIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SearchBox from '../components/SearchBox'

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: apiInfo, isLoading: apiLoading } = useQuery(
    'apiInfo',
    () => api.getApiInfo(),
    { refetchInterval: 300000 } // Refresh every 5 minutes
  )

  const handleSearch = (query) => {
    setSearchQuery(query)
    // Navigate to search page with query
    window.location.href = `/search?q=${encodeURIComponent(query)}`
  }

  // Mock statistics data - in production, these would come from API
  const stats = [
    {
      name: 'Total Scans',
      value: '24,583',
      change: '+12%',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Vulnerabilities Found',
      value: '1,847',
      change: '+3%',
      changeType: 'increase',
      icon: ShieldExclamationIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Active Hosts',
      value: '8,392',
      change: '-2%',
      changeType: 'decrease',
      icon: ServerIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Critical Alerts',
      value: '47',
      change: '+8%',
      changeType: 'increase',
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  const vulnerabilityData = [
    { name: 'Critical', value: 47, color: '#ef4444' },
    { name: 'High', value: 284, color: '#f97316' },
    { name: 'Medium', value: 892, color: '#eab308' },
    { name: 'Low', value: 624, color: '#22c55e' }
  ]

  const portData = [
    { port: '80', count: 2847 },
    { port: '443', count: 2104 },
    { port: '22', count: 1893 },
    { port: '21', count: 1247 },
    { port: '25', count: 983 },
    { port: '53', count: 756 }
  ]

  if (apiLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Shodan Network Mapper</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Network Intelligence Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Real-time network monitoring and threat analysis
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Quick Search</h3>
          </div>
          <SearchBox onSearch={handleSearch} placeholder="Search for IPs, domains, services, or vulnerabilities..." />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <ArrowTrendingUpIcon 
                          className={`self-center flex-shrink-0 h-5 w-5 ${
                            stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500 transform rotate-180'
                          }`}
                        />
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vulnerability Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Vulnerability Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Ports */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Most Common Open Ports
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="port" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* API Status */}
        {apiInfo && (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Query Credits</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {apiInfo.data?.query_credits?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Scan Credits</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {apiInfo.data?.scan_credits?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Plan</div>
                <div className="text-2xl font-semibold text-gray-900 capitalize">
                  {apiInfo.data?.plan || 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {[
                { id: 1, type: 'scan', content: 'Network scan completed for 192.168.1.0/24', time: '2 hours ago' },
                { id: 2, type: 'vulnerability', content: 'Critical vulnerability detected on 192.168.1.100', time: '4 hours ago' },
                { id: 3, type: 'alert', content: 'New host discovered: 192.168.1.200', time: '6 hours ago' },
                { id: 4, type: 'report', content: 'Weekly security report generated', time: '1 day ago' },
              ].map((item, itemIdx) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {itemIdx !== 3 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          item.type === 'vulnerability' ? 'bg-red-500' :
                          item.type === 'alert' ? 'bg-yellow-500' :
                          item.type === 'scan' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          <div className="h-2 w-2 bg-white rounded-full" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">{item.content}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard