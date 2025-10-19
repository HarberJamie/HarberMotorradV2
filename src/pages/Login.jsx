import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // No real login yet — just route to Home
    navigate('/home')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      padding: 24
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: 420,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 24
      }}>
        <h1 style={{ margin: '0 0 16px 0' }}>Sign in</h1>

        <label style={{ display: 'block', marginBottom: 8 }}>
          Username
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. jamie"
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 8 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </label>

        <button type="submit" style={buttonStyle}>
          Sign in
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  marginTop: 6,
  marginBottom: 12,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(0,0,0,0.2)',
  color: 'inherit',
  outline: 'none'
}

const buttonStyle = {
  width: '100%',
  marginTop: 8,
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.08)',
  color: 'inherit',
  fontWeight: 600,
  cursor: 'pointer'
}
