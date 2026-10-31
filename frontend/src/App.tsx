import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ExternalFormPage } from '@/pages/ExternalFormPage'
import { ExternalFormGenerate } from '@/pages/ExternalFormGenerate'
import { LoginPage } from '@/pages/LoginPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/external-form/:token" element={<ExternalFormPage />} />
        <Route
          path="/external-form/gerar"
          element={
            <ProtectedRoute>
              <ExternalFormGenerate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
