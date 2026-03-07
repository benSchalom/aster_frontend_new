import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function PortailVerify() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(30)
  const refs = useRef([])
  const navigate = useNavigate()
  const { state } = useLocation()
  const telephone = state?.telephone

  useEffect(() => {
    if (!telephone) navigate('/mes-cartes')
    refs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[i] = val
    setCode(next)
    setError('')
    if (val && i < 5) refs.current[i + 1]?.focus()
    if (next.every(d => d !== '')) verifier(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const verifier = async (codeStr) => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/portail/verify-otp`, { telephone, code: codeStr })
      localStorage.setItem('portail_token', res.data.token)
      navigate('/mes-cartes/cartes')
    } catch (e) {
      setError('Code invalide ou expiré')
      setCode(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await axios.post(`${API}/portail/send-otp`, { telephone })
      setResendCooldown(30)
      setError('')
    } catch (e) {
      setError('Erreur lors du renvoi')
    }
  }

  const telFormate = telephone ? `(${telephone.slice(0,3)}) ${telephone.slice(3,6)}-${telephone.slice(6)}` : ''

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B1120',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: '24px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '10px 20px'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: 'white', fontFamily: "'Syne', sans-serif"
            }}>A</div>
            <span style={{ color: 'white', fontFamily: "'Syne', sans-serif", fontWeight: '700', fontSize: '18px', letterSpacing: '0.05em' }}>ASTER</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '40px 32px'
        }}>
          {/* Retour */}
          <button onClick={() => navigate('/mes-cartes')} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: '13px', cursor: 'pointer', padding: '0', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>← Retour</button>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: '800',
            color: 'white', margin: '0 0 8px', letterSpacing: '-0.02em'
          }}>Vérification</h1>

          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
            Code envoyé au <span style={{ color: 'rgba(255,255,255,0.7)' }}>+1 {telFormate}</span>
          </p>

          {/* Inputs OTP */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
            {code.map((d, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                type="tel" maxLength={1} value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: '48px', height: '56px', textAlign: 'center',
                  background: d ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : d ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px', color: 'white', fontSize: '22px', fontWeight: '600',
                  outline: 'none', transition: 'all 0.15s'
                }}
              />
            ))}
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}

          {loading && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>Vérification...</p>}

          {/* Renvoi */}
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleResend} disabled={resendCooldown > 0} style={{
              background: 'none', border: 'none',
              color: resendCooldown > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.8)',
              fontSize: '13px', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
            }}>
              {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
