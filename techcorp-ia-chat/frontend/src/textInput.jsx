import { useState } from 'react'

function TextInput({ onSubmit, disabled }) {
    const [text, setText] = useState('')

    function handleChange(event) {
        setText(event.target.value)
    }

    function handleSubmit() {
        if (!text.trim()) return
        if (onSubmit) {
            onSubmit(text)
        }
        setText('')
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="textInput">
            <textarea
                id="user-text"
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Que voulez-vous savoir ?"
                rows={3}
            />
            <button type="button" onClick={handleSubmit} className="textInputButton" disabled={disabled}>
                Envoyer
            </button>
        </div>
    )
}

export default TextInput