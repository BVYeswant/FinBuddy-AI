import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, BarChart2, Zap, Settings, TrendingUp } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import clsx from 'clsx'

const NavItem = ({ icon: Icon, label, tab, active, onClick }) => (
  <motion.button
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={clsx(
      'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
      active
        ? 'bg-fin-accentDim text-fin-accent'
        : 'text-fin-muted hover:text-fin-dim hover:bg-white/5'
    )}
  >
    <Icon size={16} />
    <span className="hidden lg:block">{label}</span>
  </motion.button>
)

export default function Sidebar() {
  const { activeTab, setActiveTab, clearChat } = useChatStore()

  return (
    <div className="w-14 lg:w-56 flex-shrink-0 flex flex-col border-r border-fin-border bg-fin-surface/50 relative z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-5 border-b border-fin-border">
        <div className="w-8 h-8 rounded-lg bg-fin-accent flex items-center justify-center flex-shrink-0">
          <TrendingUp size={16} className="text-fin-bg" />
        </div>
        <span className="hidden lg:block font-display font-bold text-fin-text tracking-tight">
          FinBuddy
          <span className="text-fin-accent ml-1">AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        <NavItem
          icon={MessageSquare}
          label="Chat"
          tab="chat"
          active={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
        />
        <NavItem
          icon={BarChart2}
          label="Dashboard"
          tab="dashboard"
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-fin-border space-y-1">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={clearChat}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs text-fin-muted hover:text-fin-down hover:bg-fin-down/10 transition-all"
        >
          <Zap size={14} />
          <span className="hidden lg:block">New Chat</span>
        </motion.button>
      </div>
    </div>
  )
}
