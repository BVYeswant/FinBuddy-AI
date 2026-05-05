import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic } from 'lucide-react'
import clsx from 'clsx'

const SUGGESTIONS = [
  "What's Apple's stock price?",
  "How much is Bitcoin worth?",
  "Convert 1000 USD to EUR",
  "Latest financial news",
  "Tell me about Tesla",
  "Top 5 cryptos by market cap",
]

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSend = () => {
    if (!value.trim() || isLoading) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="space-y-3">
      {/* Quick suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSend(s)}
            disabled={isLoading}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-fin-card border border-fin-border text-fin-dim hover:border-fin-accent/50 hover:text-fin-accent transition-all disabled:opacity-40"
          >
            {s}
          </motion.button>
        ))}
      </div>

      {/* Input area */}
      <div className={clsx(
        'flex items-end gap-3 glass rounded-2xl px-4 py-3 transition-all',
        'focus-within:border-fin-accent/50 focus-within:glow-accent'
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask about stocks, crypto, currencies, news..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent text-fin-text text-sm placeholder-fin-muted resize-none outline-none leading-relaxed min-h-[24px] max-h-[120px] font-body"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!value.trim() || isLoading}
            className={clsx(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
              value.trim() && !isLoading
                ? 'bg-fin-accent hover:bg-fin-accent/90 text-fin-bg'
                : 'bg-fin-border text-fin-muted'
            )}
          >
            <Send size={15} />
          </motion.button>
        </div>
      </div>

      <p className="text-center text-xs text-fin-muted/50 font-mono">
        FinBuddy AI • Real-time financial data • Not financial advice
      </p>
    </div>
  )
}
