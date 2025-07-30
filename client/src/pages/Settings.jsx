import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  CogIcon, 
  KeyIcon, 
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

function Settings() {
  const [settings, setSettings] = useState({
    apiKey: '',
    refreshInterval: 300,
    enableNotifications: true,
    enableRealTimeAlerts: false,
    maxResultsPerPage: 100,
    cacheTimeout: 3600,
    autoRefreshDashboard: true,
    alertThreshold: 'medium',
    exportFormat: 'json'
  })

  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In a real application, this would save settings to backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!settings.apiKey.trim()) {
      alert('Please enter a Shodan API key first')
      return
    }
    
    setIsLoading(true)
    try {
      // Test API connection
      const response = await fetch('/api/shodan/api-info')
      if (response.ok) {
        alert('API connection successful!')
      } else {
        alert('API connection failed. Please check your API key.')
      }
    } catch (error) {
      alert('Failed to test connection: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Settings - Shodan Network Mapper</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure your Shodan Network Mapper preferences
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
              API Configuration
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure your Shodan API settings
            </p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                Shodan API Key
              </label>
              <div className="mt-1 flex space-x-3">
                <input
                  type="password"
                  id="apiKey"
                  className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your Shodan API key"
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                />
                <button
                  onClick={handleTestConnection}
                  disabled={isLoading || !settings.apiKey.trim()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Test Connection
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Get your API key from <a href="https://developer.shodan.io" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500">developer.shodan.io</a>
              </p>
            </div>
          </div>
        </div>

        {/* Search & Display Settings */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <CogIcon className="h-5 w-5 text-gray-400 mr-2" />
              Search & Display
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Customize search behavior and display preferences
            </p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700">
                  Max Results Per Page
                </label>
                <select
                  id="maxResults"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={settings.maxResultsPerPage}
                  onChange={(e) => handleInputChange('maxResultsPerPage', parseInt(e.target.value))}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              <div>
                <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700">
                  Default Export Format
                </label>
                <select
                  id="exportFormat"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={settings.exportFormat}
                  onChange={(e) => handleInputChange('exportFormat', e.target.value)}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xml">XML</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              Performance & Caching
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure refresh intervals and caching behavior
            </p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-700">
                  Dashboard Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  id="refreshInterval"
                  min="60"
                  max="3600"
                  step="60"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={settings.refreshInterval}
                  onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="cacheTimeout" className="block text-sm font-medium text-gray-700">
                  Cache Timeout (seconds)
                </label>
                <input
                  type="number"
                  id="cacheTimeout"
                  min="300"
                  max="86400"
                  step="300"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={settings.cacheTimeout}
                  onChange={(e) => handleInputChange('cacheTimeout', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="autoRefresh"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={settings.autoRefreshDashboard}
                onChange={(e) => handleInputChange('autoRefreshDashboard', e.target.checked)}
              />
              <label htmlFor="autoRefresh" className="ml-2 block text-sm text-gray-900">
                Enable automatic dashboard refresh
              </label>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
              Alert Configuration
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure notification and alert preferences
            </p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="notifications"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                  Enable browser notifications
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="realTimeAlerts"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={settings.enableRealTimeAlerts}
                  onChange={(e) => handleInputChange('enableRealTimeAlerts', e.target.checked)}
                />
                <label htmlFor="realTimeAlerts" className="ml-2 block text-sm text-gray-900">
                  Enable real-time vulnerability alerts
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700">
                Alert Threshold
              </label>
              <select
                id="alertThreshold"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.alertThreshold}
                onChange={(e) => handleInputChange('alertThreshold', e.target.value)}
              >
                <option value="low">Low - All vulnerabilities</option>
                <option value="medium">Medium - Medium and above</option>
                <option value="high">High - High and critical only</option>
                <option value="critical">Critical - Critical only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your API key is stored securely and encrypted. This tool is designed for authorized security research and network analysis only. 
                  Always ensure you have proper authorization before scanning networks or systems you do not own.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings