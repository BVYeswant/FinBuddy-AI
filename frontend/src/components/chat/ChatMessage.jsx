import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, User, Bot, Clock } from 'lucide-react'
import clsx from 'clsx'
import DataCard from './DataCard'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatContent(text) {
  // Convert **bold** to <strong> and line breaks
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-fin-accentDim border border-fin-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={14} className="text-fin-accent" />
        </div>
      )}

      <div className={clsx('max-w-2xl space-y-2', isUser ? 'items-end flex flex-col' : '')}>
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-fin-accent text-fin-bg font-medium rounded-tr-sm'
              : clsx(
                  'glass text-fin-text rounded-tl-sm',
                  msg.error && 'border-fin-down/40 bg-fin-down/5'
                )
          )}
        >
          {isUser ? (
            <span>{msg.content}</span>
          ) : (
            <span
              dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
            />
          )}
        </div>

        {/* Rich data card for bot messages */}
        {!isUser && msg.rawData && <DataCard data={msg.rawData} intent={msg.intent} />}

        {/* Meta row */}
        <div className={clsx('flex items-center gap-2 px-1', isUser ? 'justify-end' : '')}>
          <Clock size={10} className="text-fin-muted" />
          <span className="text-xs text-fin-muted font-mono">{formatTime(msg.ts)}</span>
          {!isUser && msg.provider && (
            <span className="text-xs text-fin-muted/60">via {msg.provider}</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-fin-border flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={14} className="text-fin-dim" />
        </div>
      )}
    </motion.div>
  )
}
