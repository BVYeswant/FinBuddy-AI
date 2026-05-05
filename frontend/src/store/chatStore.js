import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  messages: [],
  sessionId: null,
  isLoading: false,
  activeTab: 'chat', // 'chat' | 'dashboard'

  setActiveTab: (tab) => set({ activeTab: tab }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setLoading: (v) => set({ isLoading: v }),

  setSessionId: (id) => set({ sessionId: id }),

  clearChat: () => set({ messages: [], sessionId: null }),

  sendMessage: async (text, apiBaseUrl) => {
    const { sessionId, addMessage, setLoading, setSessionId } = get()
    if (!text.trim()) return

    const userMsg = { id: Date.now(), role: 'user', content: text, ts: Date.now() }
    addMessage(userMsg)
    setLoading(true)

    try {
      const res = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId || '' }),
      })
      const data = await res.json()

      if (!sessionId) setSessionId(data.session_id)

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        intent: data.intent,
        rawData: data.raw_data,
        provider: data.provider,
        ts: data.timestamp * 1000,
      }
      addMessage(botMsg)
    } catch (err) {
      addMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ Connection failed. Is the backend running? Check your .env and try again.',
        ts: Date.now(),
        error: true,
      })
    } finally {
      setLoading(false)
    }
  },
}))
