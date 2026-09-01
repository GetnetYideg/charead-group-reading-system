import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Bold, Italic, Link2, Paperclip, Image, Send, Sparkles, ArrowLeft } from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'
import TopBar from '../components/Layout/TopBar'
import { getGroup, listGroupFiles } from '../api/groups'
import { getMessages, sendMessage } from '../api/chat'
import { askAI } from '../api/ai'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './GroupChat.css'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg, isOwn, senderName }) {
  return (
    <div className={`chat-msg-row${isOwn ? ' own' : ''}`}>
      {!isOwn && (
        <div className="avatar avatar-sm chat-avatar">
          {msg.is_ai ? '🤖' : senderName?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <div className="chat-msg-wrap">
        {!isOwn && <div className="chat-msg-sender">{msg.is_ai ? 'Cha-Read AI' : senderName} <span className="chat-msg-time">{formatTime(msg.created_at)}</span></div>}
        <div className={`chat-bubble${isOwn ? ' own' : ''}${msg.is_ai ? ' ai' : ''}`}>
          {msg.content}
        </div>
        {isOwn && <div className="chat-msg-time own-time">{formatTime(msg.created_at)}</div>}
      </div>
      {isOwn && (
        <div className="avatar avatar-sm chat-avatar">
          {senderName?.[0]?.toUpperCase() || 'Y'}
        </div>
      )}
    </div>
  )
}

export default function GroupChat() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [files, setFiles] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    loadAll()
    return () => clearInterval(pollRef.current)
  }, [slug])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadAll = async () => {
    setLoading(true)
    try {
      const gRes = await getGroup(slug)
      setGroup(gRes.data)
      const [mRes, fRes] = await Promise.all([
        getMessages(gRes.data.id),
        listGroupFiles(slug)
      ])
      setMessages(mRes.data || [])
      setFiles(fRes.data || [])
      // Poll every 5s
      pollRef.current = setInterval(async () => {
        try {
          const r = await getMessages(gRes.data.id)
          setMessages(r.data || [])
        } catch {}
      }, 5000)
    } catch { addToast('Failed to load chat', 'error') }
    finally { setLoading(false) }
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || !group || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await sendMessage(group.id, content)
      setMessages(m => [...m, res.data[0]])
    } catch { addToast('Failed to send message', 'error'); setInput(content) }
    finally { setSending(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const res = await askAI(aiPrompt)
      setInput(res.data.reply || '')
      setShowAiPrompt(false)
      setAiPrompt('')
      textareaRef.current?.focus()
    } catch { addToast('AI request failed', 'error') }
    finally { setAiLoading(false) }
  }

  const insertFormat = (tag) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart, end = ta.selectionEnd
    const sel = input.slice(start, end) || 'text'
    const tags = { bold: `**${sel}**`, italic: `_${sel}_`, link: `[${sel}](url)` }
    const newVal = input.slice(0, start) + tags[tag] + input.slice(end)
    setInput(newVal)
  }

  const totalMembers = group?.member_count || 1
  const progress = files.length > 0 ? Math.min(100, Math.round((messages.length / Math.max(messages.length + 10, 20)) * 100)) : 0

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content chat-main">
        <TopBar title={group?.name || 'Group Chat'} badge={`${totalMembers} Members`} searchPlaceholder="Search discussion…">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/groups/${slug}`)}>
            <ArrowLeft size={14}/> Workspace
          </button>
        </TopBar>

        <div className="chat-layout">
          {/* Messages */}
          <div className="chat-messages-area">
            {loading ? (
              <div className="chat-loading"><span className="spinner spinner-brand" style={{width:28,height:28}}/></div>
            ) : (
              <>
                <div className="chat-date-divider"><span>Today</span></div>
                {messages.length === 0 && (
                  <div className="chat-empty">No messages yet. Be the first to say something!</div>
                )}
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.sender_id === user?.id}
                    senderName={msg.sender_name || `User ${msg.sender_id}`}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <div className="chat-toolbar">
              <button className="btn-ghost" title="Bold" onClick={() => insertFormat('bold')}><Bold size={15}/></button>
              <button className="btn-ghost" title="Italic" onClick={() => insertFormat('italic')}><Italic size={15}/></button>
              <button className="btn-ghost" title="Link" onClick={() => insertFormat('link')}><Link2 size={15}/></button>
              <button className="btn-ghost" title="Attach file" onClick={() => addToast('File attachment: use the workspace to manage files', 'info')}><Paperclip size={15}/></button>
              <button className="btn-ghost" title="Image" onClick={() => addToast('Use the workspace to upload files', 'info')}><Image size={15}/></button>
            </div>
            <textarea
              ref={textareaRef}
              id="chat-input"
              className="chat-textarea"
              placeholder="Type your message or ask Cha-Read AI…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <div className="chat-input-footer">
              <button
                id="ai-assist-btn"
                className="btn btn-sm chat-ai-btn"
                onClick={() => setShowAiPrompt(s => !s)}
              >
                <Sparkles size={13}/> Use AI Assist
              </button>
              <button
                id="send-msg-btn"
                className="btn btn-primary chat-send-btn"
                onClick={handleSend}
                disabled={sending || !input.trim()}
              >
                {sending ? <span className="spinner" style={{width:16,height:16}}/> : <Send size={16}/>}
              </button>
            </div>

            {showAiPrompt && (
              <div className="chat-ai-panel">
                <p className="chat-ai-panel-title">Ask Cha-Read AI — response will be added to your message</p>
                <div className="flex gap-2">
                  <input
                    id="ai-prompt-input"
                    className="form-input"
                    placeholder="e.g. Summarize chapter 2 of our current book"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAIAssist()}
                    autoFocus
                  />
                  <button className="btn btn-purple btn-sm" onClick={handleAIAssist} disabled={aiLoading}>
                    {aiLoading ? <span className="spinner" style={{width:14,height:14}}/> : <Send size={14}/>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="chat-right-panel">
          <div className="card chat-context-card">
            <h3 className="font-bold" style={{marginBottom:6}}>Group Context</h3>
            <p className="text-sm text-secondary">
              {group?.name} — collaborative reading group.
            </p>
          </div>

          <div className="card chat-members-card">
            <h4 className="font-semibold" style={{fontSize:12,letterSpacing:'0.06em',color:'var(--text-muted)',marginBottom:12}}>MEMBERS</h4>
            <div className="chat-member-row">
              <div className="avatar avatar-sm" style={{background:'var(--brand-faint)',color:'var(--brand)'}}>
                {user?.first_name?.[0] || user?.username?.[0] || 'Y'}
              </div>
              <div style={{flex:1}}>
                <div className="font-semibold" style={{fontSize:13}}>{user?.first_name || user?.username}</div>
                <div className="text-sm" style={{color:'var(--success)'}}>Active now</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-bold" style={{fontSize:13,marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
              📚 Library Progress
            </h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${progress}%`}} />
            </div>
            <p className="text-sm text-muted" style={{marginTop:8}}>
              {files.length} document{files.length!==1?'s':''} · {messages.length} messages
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
