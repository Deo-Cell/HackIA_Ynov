function ChatBox({ sender, text }) {
  function renderMarkdown(value) {
    if (typeof value !== 'string') return value

    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(value))) {
      if (match.index > lastIndex) {
        parts.push(value.slice(lastIndex, match.index))
      }

      if (match[1].startsWith('**')) {
        parts.push(<strong key={parts.length}>{match[2]}</strong>)
      } else {
        parts.push(<em key={parts.length}>{match[3]}</em>)
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < value.length) {
      parts.push(value.slice(lastIndex))
    }

    return parts.length > 0 ? parts : value
  }

  return (
    <div className={`chatBox ${sender}`}>
      <div className="message-label">
        {sender === 'user' ? 'Vous' : 'TechCorp AI'}
      </div>
      <p>{renderMarkdown(text)}</p>
    </div>
  )
}

export default ChatBox
