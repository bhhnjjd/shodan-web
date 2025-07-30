import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ShieldExclamationIcon,
  ServerIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SearchBox from '../components/SearchBox'

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [filters, setFilters] = useState({
    facets: searchParams.get('facets') || '',
    minify: searchParams.get('minify') === 'true'
  })

  const { data, isLoading, error, refetch } = useQuery(
    ['search', query, page, filters],
    () => api.searchHosts(query, { page, ...filters }),
    {
      enabled: !!query,
      keepPreviousData: true
    }
  )

  const handleSearch = (newQuery) => {
    setQuery(newQuery)
    setPage(1)
    setSearchParams({ q: newQuery, page: '1', ...filters })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    setSearchParams({ q: query, page: newPage.toString(), ...filters })
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== query) {
      setQuery(q)
    }
  }, [searchParams])

  const getRiskBadge = (vulnCount) => {
    if (vulnCount === 0) return { text: 'Low', class: 'badge-green' }
    if (vulnCount < 5) return { text: 'Medium', class: 'badge-yellow' }
    if (vulnCount < 10) return { text: 'High', class: 'badge-red' }
    return { text: 'Critical', class: 'badge-red' }
  }

  const formatLastUpdate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <>
      <Helmet>
        <title>Search - Shodan Network Mapper</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Search</h1>
          <p className="mt-2 text-sm text-gray-700">
            Search the global internet for devices, services, and vulnerabilities
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-6">
          <div className="space-y-4">
            <SearchBox 
              onSearch={handleSearch} 
              placeholder="Search for IPs, services, countries, organizations..."
            />
            
            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center space-x-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Filters:</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Facets (e.g., country,org)"
                  className="input py-1 px-2 text-sm w-48"
                  value={filters.facets}
                  onChange={(e) => setFilters(prev => ({ ...prev, facets: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="minify"
                  checked={filters.minify}
                  onChange={(e) => setFilters(prev => ({ ...prev, minify: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="minify" className="text-gray-600">Minify results</label>
              </div>
            </div>
          </div>
        </div>

        {/* Search Examples */}
        {!query && (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Search Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Basic Searches</h4>
                <div className="space-y-1 text-sm">
                  <button 
                    onClick={() => handleSearch('apache')}
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    apache - Find Apache web servers
                  </button>
                  <button 
                    onClick={() => handleSearch('port:22')}
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    port:22 - Find SSH servers
                  </button>
                  <button 
                    onClick={() => handleSearch('country:US')}
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    country:US - Find hosts in United States
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Advanced Searches</h4>
                <div className="space-y-1 text-sm">
                  <button 
                    onClick={() => handleSearch('product:nginx country:CN')}
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    product:nginx country:CN - Nginx in China
                  </button>
                  <button 
                    onClick={() => handleSearch('vuln:CVE-2017-0144')}
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    vuln:CVE-2017-0144 - EternalBlue vulnerable hosts
                  </button>
                  <button 
                    onClick={() => handleSearch('has_screenshot:true http.title:"login"')}
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    has_screenshot:true http.title:"login" - Login pages with screenshots
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage error={error} onRetry={refetch} />
        )}

        {/* Results */}
        {data && data.data && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Found {data.data.total?.toLocaleString()} results for "{query}"
              </div>
              <div className="text-sm text-gray-500">
                Page {page} of {Math.ceil((data.data.total || 0) / 100)}
              </div>
            </div>

            {/* Facets */}
            {data.data.facets && Object.keys(data.data.facets).length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Result Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(data.data.facets).map(([facet, values]) => (
                    <div key={facet} className="space-y-2">
                      <h4 className="font-medium text-gray-800 capitalize">
                        {facet.replace('_', ' ')}
                      </h4>
                      <div className="space-y-1">
                        {values.slice(0, 5).map(([value, count]) => (
                          <div key={value} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate">{value}</span>
                            <span className="text-gray-500">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host Results */}
            <div className="space-y-4">
              {data.data.matches?.map((host) => (
                <div key={`${host.ip_str}-${host.port}`} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Host Header */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <ServerIcon className="h-5 w-5 text-gray-400" />
                          <Link 
                            to={`/host/${host.ip_str}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800"
                          >
                            {host.ip_str}
                          </Link>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="badge badge-blue">Port {host.port}</span>
                          {host.transport && (
                            <span className="badge badge-gray">{host.transport.toUpperCase()}</span>
                          )}
                        </div>
                        {host.vulns && Object.keys(host.vulns).length > 0 && (
                          <div className="flex items-center space-x-1">
                            <ShieldExclamationIcon className="h-4 w-4 text-red-500" />
                            <span className={`badge ${getRiskBadge(Object.keys(host.vulns).length).class}`}>
                              {Object.keys(host.vulns).length} vulns
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Host Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {host.org && (
                          <div>
                            <span className="text-gray-500">Organization:</span>
                            <div className="font-medium">{host.org}</div>
                          </div>
                        )}
                        {host.location && (
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <div className="font-medium flex items-center">
                              <GlobeAltIcon className="h-4 w-4 mr-1" />
                              {host.location.city}, {host.location.country_name}
                            </div>
                          </div>
                        )}
                        {host.product && (
                          <div>
                            <span className="text-gray-500">Product:</span>
                            <div className="font-medium">{host.product}</div>
                          </div>
                        )}
                        {host.timestamp && (
                          <div>
                            <span className="text-gray-500">Last Seen:</span>
                            <div className="font-medium">{formatLastUpdate(host.timestamp)}</div>
                          </div>
                        )}
                      </div>

                      {/* Banner Preview */}
                      {host.data && (
                        <div className="bg-gray-50 rounded p-3">
                          <div className="text-xs text-gray-500 mb-1">Banner:</div>
                          <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap break-all">
                            {host.data.substring(0, 200)}
                            {host.data.length > 200 && '...'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link
                        to={`/host/${host.ip_str}`}
                        className="btn btn-primary text-xs px-3 py-1"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.data.total > 100 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, Math.ceil(data.data.total / 100)) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded text-sm ${
                          page === pageNum 
                            ? 'bg-primary-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(data.data.total / 100)}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Search