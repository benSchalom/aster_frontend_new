import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/constants'
import { styles } from './Login.styles'
import { validerMotDePasse } from '../../utils/validation'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nouveau: '', confirmer: '' })
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')

    const erreursMdp = validerMotDePasse(form.nouveau)
    if (erreursMdp.length > 0) {
      setErreur(erreursMdp[0])
      return
    }
    if (form.nouveau !== form.confirmer) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }

    setEnvoi(true)
    try {
      await axios.post(API_URL + '/auth/reset-password', {
        token,
        nouveau_password: form.nouveau,
      })
      navigate('/login?reset=success')
    } catch (err) {
      setErreur(err.response?.data?.error || 'Lien invalide ou expiré')
      setEnvoi(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        <div style={styles.logoSection}>
          <img src="/web-app-manifest-192x192.png" alt="ASTER" style={styles.logo} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={styles.title}>Nouveau mot de passe</h1>
            <p style={styles.subtitle}>Choisissez un mot de passe sécurisé</p>
          </div>
        </div>

        <div style={styles.card}>
          {erreur && <div style={styles.erreur}>{erreur}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Nouveau mot de passe</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.nouveau}
                  onChange={(e) => setForm({ ...form, nouveau: e.target.value })}
                  required
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirmer le mot de passe</label>
              <input
                type="password"
                value={form.confirmer}
                onChange={(e) => setForm({ ...form, confirmer: e.target.value })}
                required
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={envoi}
              style={{ ...styles.btn, opacity: envoi ? 0.6 : 1 }}>
              {envoi ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        </div>

        <p style={styles.footer}>
          <Link to="/login" style={styles.link}>← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
