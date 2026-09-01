import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Send, X, ZoomIn, ZoomOut, Bot, Sparkles } from 'lucide-react'
import { getFileMetadata, getDownloadUrl } from '../api/files'
import { askAI } from '../api/ai'
import { useToast } from '../context/ToastContext'
import './PDFReader.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

const QUICK_PROMPTS = [
  { label: '📄 Summarize chapter', prompt: 'Summarize the key points of this chapter' },
  { label: '🔑 Key takeaways', prompt: 'What are the key takeaways from this text?' },
  { label: '💡 Explain concept', prompt: 'Explain the main concept in simple terms' },
  { label: '🌐 Translate selection', prompt: 'Help me understand the difficult passages in this text' },
]

export default function PDFReader() {
  const { fileId } = useParams()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [fileUrl, setFileUrl] = useState(null)
  const [fileName, setFileName] = useState('Document')
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.25)
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', content: "I'm your Cha-Read AI assistant. Ask me anything about this book!" }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const aiEndRef = useRef(null)

  useEffect(() => {
    loadFile()
  }, [fileId])

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [aiMessages])

  const loadFile = async () => {
    try {
      const res = await getFileMetadata(fileId)
      const meta = res.data?.data?.[0]
      if (meta) {
        setFileName(meta.original_name || 'Document')
        // Use backend download endpoint (authenticated)
        setFileUrl(getDownloadUrl(fileId))
      }
    } catch {
      setLoadError(true)
      addToast('Failed to load file', 'error')
    }
  }

  const sendAI = async (text) => {
    const content = text || aiInput.trim()
    if (!content || aiLoading) return
    setAiInput('')
    setAiMessages(m => [...m, { role: 'user', content }])
    setAiLoading(true)
    try {
      const res = await askAI(`Regarding the document "${fileName}": ${content}`)
      setAiMessages(m => [...m, { role: 'ai', content: res.data.reply }])
    } catch { addToast('AI request failed', 'error') }
    finally { setAiLoading(false) }
  }

  return (
    <div className="reader-layout">
      {/* Top bar */}
      <div className="reader-topbar">
        <div className="reader-topbar-left">
          <button className="btn-ghost" onClick={() => navigate(-1)} title="Go back">☰</button>
          <span className="reader-filename">{fileName}</span>
        </div>
        <div className="reader-zoom">
          <button className="btn-ghost" onClick={() => setScale(s => Math.max(0.5, s - 0.25))}><ZoomOut size={16}/></button>
          <span>{Math.round(scale * 100)}%</span>
          <button className="btn-ghost" onClick={() => setScale(s => Math.min(3, s + 0.25))}><ZoomIn size={16}/></button>
        </div>
        <div className="reader-topbar-right">
          <div className="reader-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search in book…" />
          </div>
        </div>
      </div>

      <div className="reader-body">
        {/* Thumbnail strip */}
        <div className="reader-thumbnails">
          <div className="reader-thumb-label">THUMBNAILS</div>
          {numPages && Array.from({ length: numPages }, (_, i) => (
            <div
              key={i}
              className={`reader-thumb${currentPage === i + 1 ? ' active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              <Document file={fileUrl} loading="">
                <Page pageNumber={i + 1} width={120} renderAnnotationLayer={false} renderTextLayer={false} loading="" />
              </Document>
              <span className="reader-thumb-num">{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Main PDF area */}
        <div className="reader-main">
          {loadError ? (
            <div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Could not load PDF</p>
              <p>Make sure the backend is running and you have access.</p>
            </div>
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => setLoadError(true)}
              loading={<div style={{padding:40,textAlign:'center'}}><span className="spinner spinner-brand" style={{width:32,height:32}}/></div>}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderAnnotationLayer={true}
                renderTextLayer={true}
              />
            </Document>
          )}
          {numPages && (
            <div className="reader-page-indicator">Page {currentPage} of {numPages}</div>
          )}
        </div>

        {/* AI Sidebar */}
        <div className="reader-ai-sidebar">
          <div className="reader-ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar avatar-sm" style={{ background: 'var(--accent-purple)', color: '#fff' }}><Bot size={14}/></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Cha-Read Assistant</div>
                <div style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="online-dot" /> Online
                </div>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => navigate(-1)}><X size={16}/></button>
          </div>

          <div className="reader-ai-messages">
            {aiMessages.map((m, i) => (
              <div key={i} className={`reader-ai-msg${m.role === 'user' ? ' user' : ''}`}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.content}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="reader-ai-msg">
                <div className="typing-dots"><span/><span/><span/></div>
              </div>
            )}
            <div ref={aiEndRef}/>
          </div>

          <div className="reader-ai-quick">
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Quick Prompts</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} className="btn btn-outline btn-sm" style={{ fontSize: 11, borderRadius: 99, padding: '4px 10px' }}
                  onClick={() => sendAI(p.prompt)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="reader-ai-input-area">
            <textarea
              id="reader-ai-input"
              className="reader-ai-input"
              placeholder="Ask Cha-Read anything about this book…"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendAI())}
              rows={2}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" style={{ padding: 4 }}>📎</button>
                <button className="btn-ghost" style={{ padding: 4 }}>🎤</button>
              </span>
              <button
                id="reader-ai-send-btn"
                className="btn btn-purple btn-sm"
                style={{ borderRadius: 8 }}
                onClick={() => sendAI()}
                disabled={aiLoading || !aiInput.trim()}
              >
                <Send size={13}/>
              </button>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>Press Cmd + Enter to send</div>
          </div>
        </div>
      </div>

      {/* Left nav icons */}
      <div className="reader-left-nav">
        <div className="reader-nav-logo">C</div>
        <div className="reader-nav-icons">
          <button className="reader-nav-icon" title="Home" onClick={() => navigate('/dashboard')}>🏠</button>
          <button className="reader-nav-icon" title="Library" onClick={() => navigate('/groups')}>📚</button>
          <button className="reader-nav-icon active" title="Reading">📖</button>
          <button className="reader-nav-icon" title="Groups" onClick={() => navigate('/groups')}>👥</button>
          <button className="reader-nav-icon" title="AI" onClick={() => navigate('/ai')}>🤖</button>
        </div>
        <div className="reader-nav-bottom">
          <button className="reader-nav-icon" title="Settings">⚙️</button>
        </div>
      </div>
    </div>
  )
}
