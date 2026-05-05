import React from 'react'
import { Toaster } from 'react-hot-toast'
import { useChatStore } from './store/chatStore'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import Sidebar from './components/ui/Sidebar'
import TickerBar from './components/ui/TickerBar'

export default function App() {
  const { activeTab } = useChatStore()

  return (
    <div className="flex h-screen overflow-hidden bg-fin-bg relative">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,170,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,170,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(0,212,170,0.06) 0%, transparent 70%)',
        }}
      />

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TickerBar />
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? <ChatPage /> : <DashboardPage />}
        </div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--fin-card)',
            color: 'var(--fin-text)',
            border: '1px solid var(--fin-border)',
            fontFamily: 'DM Sans',
          },
        }}
      />
    </div>
  )
}
