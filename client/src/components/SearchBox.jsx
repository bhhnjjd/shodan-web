import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function SearchBox({ onSearch, placeholder = 'Search...', className = '' }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          type="submit"
          className="h-full px-4 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
          disabled={!query.trim()}
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBox