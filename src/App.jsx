import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import AccountDrawer from './components/layout/AccountDrawer'
import Plan from './pages/Plan'
import Flow from './pages/Flow'
import Reset from './pages/Reset'
import './index.css'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="max-w-sm mx-auto min-h-svh relative overflow-x-hidden" style={{ backgroundColor: 'var(--page-bg)' }}>
          <Header onMenuClick={() => setDrawerOpen(true)} />
          <main>
            <Routes>
              <Route path="/"      element={<Plan />} />
              <Route path="/flow"  element={<Flow />} />
              <Route path="/reset" element={<Reset />} />
            </Routes>
          </main>
          <BottomNav />
          <AccountDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
