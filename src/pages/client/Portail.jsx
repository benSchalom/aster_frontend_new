import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function Portail() {
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const formaterAffichage = (val) => {
    const chiffres = val.replace(/\D/g, '').slice(0, 10)
    if (chiffres.length <= 3) return chiffres
    if (chiffres.length <= 6) return `(${chiffres.slice(0,3)}) ${chiffres.slice(3)}`
    return `(${chiffres.slice(0,3)}) ${chiffres.slice(3,6)}-${chiffres.slice(6)}`
  }

  const handleChange = (e) => {
    setTelephone(formaterAffichage(e.target.value))
    setError('')
  }

  const handleSubmit = async () => {
    const chiffres = telephone.replace(/\D/g, '')
    if (chiffres.length !== 10) {
      setError('Entrez un numéro à 10 chiffres')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API}/portail/send-otp`, { telephone: chiffres })
      navigate('/mes-cartes/verify', { state: { telephone: chiffres } })
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B1120',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '24px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Glow background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)'
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '10px 20px'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: 'white',
              fontFamily: "'Syne', sans-serif"
            }}>A</div>
            <span style={{ color: 'white', fontFamily: "'Syne', sans-serif", fontWeight: '700', fontSize: '18px', letterSpacing: '0.05em' }}>ASTER</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px 32px'
        }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '26px', fontWeight: '800',
            color: 'white', margin: '0 0 8px',
            letterSpacing: '-0.02em'
          }}>Mes cartes fidélité</h1>

          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
            Entrez votre numéro pour accéder à toutes vos cartes ASTER.
          </p>

          {/* Input téléphone */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '500', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Numéro de téléphone
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.3)', fontSize: '14px', userSelect: 'none'
              }}>🇨🇦 +1</span>
              <input
                type="tel"
                value={telephone}
                onChange={handleChange}
                placeholder="(819) 123-4567"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  padding: '14px 16px 14px 72px',
                  color: 'white', fontSize: '16px',
                  outline: 'none', letterSpacing: '0.05em'
                }}
              />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
          </div>

          {/* Bouton */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '12px',
              padding: '15px', color: 'white',
              fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em', marginTop: '8px',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Envoi en cours...' : 'Recevoir mon code →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '24px' }}>
          Un code SMS sera envoyé à votre numéro
        </p>
      </div>
    </div>
  )
}
