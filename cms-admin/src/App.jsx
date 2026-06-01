import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Articles from './pages/Articles'
import ArticleEditor from './pages/ArticleEditor'
import Media from './pages/Media'
import Taxonomy from './pages/Taxonomy'
import Navigation from './pages/Navigation'
import Architecture from './pages/Architecture'
import Users from './pages/Users'
import Settings from './pages/Settings'
import Discovery from './pages/Discovery'
import AIStudio from './pages/AIStudio'
import ContactMessages from './pages/ContactMessages'

function Error404() {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-500 text-lg">This section is currently under construction.</p>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading…
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="articles" element={<Articles />} />
          <Route path="articles/new" element={<ArticleEditor />} />
          <Route path="articles/:id" element={<ArticleEditor />} />
          <Route path="media" element={<Media />} />
          <Route path="taxonomy" element={<Taxonomy />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="ai-studio" element={<AIStudio />} />
          <Route path="contact" element={<ContactMessages />} />
          <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
