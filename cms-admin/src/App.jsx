import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function Error404() {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center">
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-500 text-lg">This section is currently under construction.</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
