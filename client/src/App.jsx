import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import HostDetails from './pages/HostDetails'
import Vulnerabilities from './pages/Vulnerabilities'
import NetworkAnalysis from './pages/NetworkAnalysis'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <>
      <Helmet>
        <title>Shodan Network Mapper</title>
        <meta name="description" content="Advanced network mapping and vulnerability analysis tool" />
      </Helmet>
      
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/host/:ip" element={<HostDetails />} />
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/network-analysis" element={<NetworkAnalysis />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App