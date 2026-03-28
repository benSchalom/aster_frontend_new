import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { styles } from './Rejoindre.styles'

export default function Rejoindre() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [pro, setPro] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    const chargerPro = async () => {
      try {
        const res = await api.get('/carte/pro/' + slug)
        setPro(res.data.pro)
      } catch (_e) {
        setPro(null)
      } finally {
        setChargement(false)
      }
    }
    chargerPro()
  }, [slug])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErreur('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      setErreur('Votre nom est requis')
      return
    }
    setEnvoi(true)
    try {
      await api.post('/carte/creer', { slug, ...form })
      const portailUrl = import.meta.env.VITE_PORTAIL_URL || 'https://aster-client.vercel.app'
      const tel = form.phone.replace(/\D/g, '')
      window.location.href = tel
        ? `${portailUrl}/connexion?tel=${tel}`
        : `${portailUrl}/connexion`
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors de la création de la carte')
      setEnvoi(false)
    }
  }

  if (chargement) {
    return (
      <div style={styles.page}>
        <div style={{ color: '#7A92B4', fontSize: '16px' }}>Chargement...</div>
      </div>
    )
  }

  if (!pro) {
    return (
      <div style={styles.page}>
        <div style={styles.notFound}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7A92B4" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style={styles.notFoundTitle}>Établissement introuvable</div>
          <div style={styles.notFoundSub}>Ce lien ne correspond à aucun établissement actif.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>

        {/* En-tête pro */}
        <div style={styles.proHeader}>
          {pro.logo_url ? (
            <img src={pro.logo_url} alt={pro.business_nom} style={styles.proLogo} />
          ) : (
            <div style={styles.proLogoFallback}>
              {pro.business_nom?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={styles.proName}>{pro.business_nom}</div>
            {pro.adresse && <div style={styles.proAddr}>{pro.adresse}</div>}
          </div>
          {pro.reward_description && (
            <div style={styles.rewardBadge}>
              🎁 {pro.reward_description}
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div style={styles.card}>
          <div>
            <div style={styles.cardTitle}>Créer ma carte fidélité</div>
            <div style={styles.cardSub}>
              Entrez vos informations pour recevoir votre carte et commencer à accumuler des points.
            </div>
          </div>

          {erreur && <div style={styles.erreur}>{erreur}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Votre nom complet *</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder="Marie Tremblay"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Numéro de téléphone (optionnel)</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="819-555-0123"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={envoi}
              style={{ ...styles.btn, opacity: envoi ? 0.6 : 1 }}
            >
              {envoi ? 'Création en cours...' : 'Créer ma carte'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
