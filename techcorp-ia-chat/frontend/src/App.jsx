import { useState } from 'react'
import TextInput from './textInput.jsx'
import ChatBox from './chatBox.jsx'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

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

    // add user message immediately
    const userMessage = { id: Date.now(), sender: 'user', text: text.trim() }
    setMessages((prevMessages) => [...prevMessages, userMessage])

    // send to API
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
    <>
      <div className="mainContent">
        <h3>TechCorp Chat Bot</h3>

        {messages.length === 0 ? (
          <div className="emptyState">
            <p>Commencez la conversation en envoyant votre premier message.</p>
          </div>
        ) : (
          <>
            <div className="chatList">
              {messages.map((message) => (
                <ChatBox key={message.id} sender={message.sender} text={message.text} />
              ))}
              {loading && (
                <div className="loadingStatus">
                  <div className="spinner loadingSpinner" aria-hidden="true" />
                  <p>En cours...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <TextInput onSubmit={handleSend} disabled={loading} />
    </>
  )
}

export default App
