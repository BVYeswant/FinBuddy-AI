import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useChatStore } from '../store/chatStore'
import ChatMessage from '../components/chat/ChatMessage'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatInput from '../components/chat/ChatInput'
import { TrendingUp, Zap } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const WELCOME_PROMPTS = [
  { icon: '📈', label: 'Stock Price', msg: "What's AAPL stock price?" },
  { icon: '₿',  label: 'Crypto',      msg: "How much is Bitcoin worth?" },
  { icon: '💱', label: 'Currency',    msg: "Convert 500 USD to INR" },
  { icon: '📰', label: 'News',        msg: "Latest financial news" },
]

function WelcomeScreen({ onPrompt }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-4 space-y-8"
    >
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-fin-accentDim border border-fin-accent/30 flex items-center justify-center mx-auto glow-accent">
          <TrendingUp size={28} className="text-fin-accent" />
        </div>
        <h1 className="font-display text-3xl font-bold text-fin-text">
          Welcome to <span className="text-fin-accent">FinBuddy AI</span>
        </h1>
        <p className="text-fin-dim text-sm max-w-md leading-relaxed">
          Your real-time AI-powered financial assistant. Ask about stocks, crypto,
          currencies, market news, and company fundamentals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {WELCOME_PROMPTS.map((p) => (
          <motion.button
            key={p.label}
            whileHover={{ scale: 1.03, borderColor: 'rgba(0,212,170,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPrompt(p.msg)}
            className="glass rounded-xl p-4 text-left hover:glow-accent transition-all border border-fin-border"
          >
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="text-sm font-display font-medium text-fin-text">{p.label}</div>
            <div className="text-xs text-fin-muted mt-0.5">{p.msg}</div>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-fin-muted">
        <Zap size={12} className="text-fin-accent" />
        <span>Powered by LangGraph + Multi-LLM routing</span>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const { messages, isLoading, sendMessage } = useChatStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = (text) => sendMessage(text, API_BASE)

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <WelcomeScreen onPrompt={handleSend} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              {isLoading && <TypingIndicator key="typing" />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-fin-border bg-fin-surface/50 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
