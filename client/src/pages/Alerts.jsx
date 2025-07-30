import { useState } from 'react'
import { useQuery } from 'react-query'
import { Helmet } from 'react-helmet-async'
import { 
  BellIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

function Alerts() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAlert, setNewAlert] = useState({
    name: '',
    ip: '',
    expires: ''
  })

  const { data: alerts, isLoading, error, refetch } = useQuery(
    'alerts',
    () => api.getAlerts(),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  )

  // Mock alert data for demonstration
  const mockAlerts = [
    {
      id: '1',
      name: 'Production Network Monitor',
      ip: '192.168.1.0/24',
      created: '2023-12-01T10:00:00Z',
      expires: '2024-06-01T10:00:00Z',
      status: 'active',
      triggers: 23,
      lastTriggered: '2023-12-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Critical Infrastructure Watch',
      ip: '10.0.0.100',
      created: '2023-11-15T09:00:00Z',
      expires: null,
      status: 'active',
      triggers: 5,
      lastTriggered: '2023-12-10T16:45:00Z'
    },
    {
      id: '3',
      name: 'DMZ Monitoring',
      ip: '203.0.113.0/28',
      created: '2023-12-10T15:30:00Z',
      expires: '2024-01-10T15:30:00Z',
      status: 'paused',
      triggers: 0,
      lastTriggered: null
    }
  ]

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    try {
      await api.createAlert(newAlert.name, newAlert.ip, newAlert.expires || null)
      setNewAlert({ name: '', ip: '', expires: '' })
      setShowCreateModal(false)
      refetch()
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const handleDeleteAlert = async (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await api.deleteAlert(id)
        refetch()
      } catch (error) {
        console.error('Failed to delete alert:', error)
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-700 bg-green-100',
      paused: 'text-yellow-700 bg-yellow-100',
      expired: 'text-red-700 bg-red-100'
    }
    return colors[status] || 'text-gray-700 bg-gray-100'
  }

  return (
    <>
      <Helmet>
        <title>Alerts - Shodan Network Mapper</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Network Alerts</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor specific IP ranges and get notified when changes occur
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Alert
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {mockAlerts.filter(a => a.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {mockAlerts.reduce((sum, alert) => sum + alert.triggers, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Triggers</div>
              </div>
              <BellIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {mockAlerts.filter(a => new Date(a.lastTriggered) > new Date(Date.now() - 24*60*60*1000)).length}
                </div>
                <div className="text-sm text-gray-600">Last 24h</div>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {mockAlerts.filter(a => a.status === 'paused').length}
                </div>
                <div className="text-sm text-gray-600">Paused</div>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Alerts</h3>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorMessage error={error} onRetry={refetch} />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{alert.name}</h4>
                        <span className={`badge ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Target:</span>
                          <div className="font-mono">{alert.ip}</div>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <div>{formatDate(alert.created)}</div>
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span>
                          <div>{alert.expires ? formatDate(alert.expires) : 'Never'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Triggers:</span>
                          <div>{alert.triggers} times</div>
                        </div>
                      </div>
                      
                      {alert.lastTriggered && (
                        <div className="mt-2 text-sm text-gray-600">
                          Last triggered: {formatDate(alert.lastTriggered)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="btn btn-secondary text-sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="btn btn-danger text-sm"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {mockAlerts.length === 0 && (
                <div className="p-6 text-center">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first network alert.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Alert
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alert Activity</h3>
          <div className="space-y-4">
            {[
              {
                id: 1,
                alert: 'Production Network Monitor',
                message: 'New host discovered: 192.168.1.150',
                time: '2 hours ago',
                type: 'info'
              },
              {
                id: 2,
                alert: 'Critical Infrastructure Watch',
                message: 'Service change detected on port 443',
                time: '6 hours ago',
                type: 'warning'
              },
              {
                id: 3,
                alert: 'Production Network Monitor',
                message: 'Host 192.168.1.100 went offline',
                time: '1 day ago',
                type: 'error'
              }
            ].map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                  activity.type === 'error' ? 'bg-red-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900">{activity.alert}</div>
                  <div className="text-sm text-gray-600">{activity.message}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Alert</h3>
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Name
                  </label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    placeholder="e.g., Production Network Monitor"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address or CIDR Range
                  </label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    placeholder="e.g., 192.168.1.0/24 or 10.0.0.1"
                    value={newAlert.ip}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, ip: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={newAlert.expires}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, expires: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Alerts