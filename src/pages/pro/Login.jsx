import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { styles } from './Login.styles'
import axios from 'axios'
import { API_URL } from '../../utils/constants'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const res = await axios.post(API_URL + '/auth/login', form)
      await login(res.data.access_token, res.data.refresh_token, res.data.pro)
      navigate('/dashboard')
    } catch (err) {
      setErreur(err.response?.data?.error || 'Identifiants incorrects')
      setChargement(false)
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
            <h1 style={styles.title}>ASTER</h1>
            <p style={styles.subtitle}>Connexion à votre espace commerçant</p>
          </div>
        </div>

        <div style={styles.card}>
          {erreur && <div style={styles.erreur}>{erreur}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>

            <div style={styles.field}>
              <label style={styles.label}>Adresse courriel</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="marie@salon.com"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={chargement}
              style={{ ...styles.btn, opacity: chargement ? 0.6 : 1 }}
            >
              {chargement ? 'Connexion en cours...' : 'Se connecter'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Link to="/forgot-password" style={{ ...styles.link, fontSize: '13px' }}>
                Mot de passe oublié ?
              </Link>
            </div>

          </form>
        </div>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.link}>Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}