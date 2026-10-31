import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { useAuth } from '@/auth/useAuth'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ExternalFormPage } from '@/pages/ExternalFormPage'
import { ExternalFormGenerate } from '@/pages/ExternalFormGenerate'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'ADMIN' | 'PROFESSOR' }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Verificando sua sessão…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Verificando sua sessão…</div>
  return <Navigate to={user?.role === 'ADMIN' ? '/admin/usuarios' : user ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/external-form/:token" element={<ExternalFormPage />} />
          <Route path="/external-form/gerar" element={<ProtectedRoute><ExternalFormGenerate /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute role="ADMIN"><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
