import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/constants'
import { styles } from './Login.styles'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [succes, setSucces] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    setErreur('')
    try {
      await axios.post(API_URL + '/auth/forgot-password', { email })
      setSucces('Si cet email existe, un lien de réinitialisation a été envoyé.')
    } catch (_e) {
      setErreur('Une erreur est survenue. Réessayez.')
    } finally {
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
            <h1 style={styles.title}>Mot de passe oublié</h1>
            <p style={styles.subtitle}>Entrez votre email pour recevoir un lien de réinitialisation</p>
          </div>
        </div>

        <div style={styles.card}>
          {succes && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(20,200,120,0.1)', border: '1px solid rgba(20,200,120,0.3)',
              color: '#4DFFA8', fontSize: '14px',
            }}>
              {succes}
            </div>
          )}
          {erreur && <div style={styles.erreur}>{erreur}</div>}

          {!succes && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Adresse courriel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="marie@salon.com"
                  style={styles.input}
                />
              </div>
              <button type="submit" disabled={envoi}
                style={{ ...styles.btn, opacity: envoi ? 0.6 : 1 }}>
                {envoi ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>
          )}
        </div>

        <p style={styles.footer}>
          <Link to="/login" style={styles.link}>← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
