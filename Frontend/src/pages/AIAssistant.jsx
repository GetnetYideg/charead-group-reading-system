import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Trash2, Bot } from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'
import TopBar from '../components/Layout/TopBar'
import { askAI } from '../api/ai'
import { useToast } from '../context/ToastContext'

const QUICK_PROMPTS = [
  'Summarize the key themes of a literary work',
  'Explain the concept of transcendentalism',
  'Give me discussion questions for a book club',
  'Compare two philosophical schools of thought',
]

export default function AIAssistant() {
  const { addToast } = useToast()
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm the Cha-Read AI assistant. Ask me anything about books, literature, philosophy, or your reading groups." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMsg = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content }])
    setLoading(true)
    try {
      const res = await askAI(content)
      setMessages(m => [...m, { role: 'ai', content: res.data.reply }])
    } catch { addToast('AI request failed', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title="AI Assistant" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxWidth: 800, width: '100%', alignSelf: 'center', width: '100%', padding: '0 24px' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <div className="avatar avatar-sm" style={{
                  background: m.role === 'ai' ? 'var(--accent-purple)' : 'var(--brand-faint)',
                  color: m.role === 'ai' ? '#fff' : 'var(--brand)',
                  flexShrink: 0
                }}>
                  {m.role === 'ai' ? <Bot size={15} /> : (null)}
                </div>
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? 'var(--brand)' : 'var(--surface)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="avatar avatar-sm" style={{ background: 'var(--accent-purple)', color: '#fff' }}><Bot size={15} /></div>
                <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--border)' }}>
                  <div className="typing-dots"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 12 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} className="btn btn-outline btn-sm" style={{ fontSize: 12, borderRadius: 99 }} onClick={() => sendMsg(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, paddingBottom: 20, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Sparkles size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-purple)' }} />
              <input
                id="ai-chat-input"
                className="form-input"
                style={{ paddingLeft: 34, paddingRight: 14, borderRadius: 99 }}
                placeholder="Ask anything about books or literature…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                disabled={loading}
              />
            </div>
            <button
              id="ai-send-btn"
              className="btn btn-purple"
              style={{ borderRadius: 99, padding: '10px 20px' }}
              onClick={() => sendMsg()}
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
