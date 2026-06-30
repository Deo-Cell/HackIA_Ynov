import { useState, useRef, useEffect } from 'react'
import TextInput from './textInput.jsx'
import ChatBox from './chatBox.jsx'
import './App.css'

const SUGGESTIONS = [
  "What is a P/E ratio?",
  "Explain hedge funds",
  "How to read a balance sheet?",
  "What is diversification?",
]

function App() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function extractText(value) {
    if (value == null) return null
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) {
      return value.map(extractText).filter(Boolean).join('\n')
    }
    if (typeof value === 'object') {
      if ('content' in value) return extractText(value.content)
      if ('text' in value) return extractText(value.text)
      if ('output_text' in value) return extractText(value.output_text)
      if ('message' in value) return extractText(value.message)
      if ('choices' in value && Array.isArray(value.choices)) {
        return value.choices.map(extractText).filter(Boolean).join('\n')
      }
      if ('data' in value) return extractText(value.data)
      if ('output' in value) return extractText(value.output)
      const nested = Object.values(value).map(extractText).filter(Boolean)
      return nested.length ? nested.join('\n') : JSON.stringify(value, null, 2)
    }
    return null
  }

  async function handleSend(text) {
    if (!text.trim()) return

    const userMessage = { id: Date.now(), sender: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMessage])

    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/chat'
      const payload = {
        model: 'phi35-financial',
        messages: [{ role: 'user', content: text.trim() }],
        stream: false,
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)

      const data = await res.json()
      const botText = extractText(data) || 'Réponse vide'

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'system', text: botText },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'system', text: `Erreur: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">TC</div>
          <span className="sidebar-title">TechCorp AI</span>
        </div>

        <div className="sidebar-status">
          <span className="status-dot"></span>
          Modèle connecté
        </div>

        <div className="sidebar-info">
          <strong>Phi-3.5 Financial</strong>
          Assistant spécialisé en finance, investissements et analyse financière.
        </div>
      </aside>

      <main className="mainContent">
        <div className="chat-header">
          <h3>Financial Assistant</h3>
          <span className="chat-header-badge">Phi-3.5</span>
        </div>

        {messages.length === 0 ? (
          <div className="emptyState">
            <div className="emptyState-icon">💹</div>
            <h4>Comment puis-je vous aider ?</h4>
            <p>Posez vos questions sur la finance, les investissements, le trading ou l'analyse financière.</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chatList">
            {messages.map((message) => (
              <ChatBox key={message.id} sender={message.sender} text={message.text} />
            ))}
            {loading && (
              <div className="loadingStatus">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>Analyse en cours...</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        <div className="input-area">
          <TextInput onSubmit={handleSend} disabled={loading} />
        </div>
      </main>
    </div>
  )
}

export default App
