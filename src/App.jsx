import { Route, Routes, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import CreateVaultPage from './pages/CreateVaultPage'
import RetrieveVaultPage from './pages/RetrieveVaultPage'
import VaultViewPage from './pages/VaultViewPage'
import ExpiredPage from './pages/ExpiredPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/create" replace />} />
        <Route path="/create" element={<CreateVaultPage />} />
        <Route path="/retrieve" element={<RetrieveVaultPage />} />
          <Route path="/s/:code" element={<VaultViewPage />} />
        <Route path="/expired" element={<ExpiredPage />} />
        <Route path="*" element={<Navigate to="/create" replace />} />
      </Routes>
    </Layout>
  )
}
