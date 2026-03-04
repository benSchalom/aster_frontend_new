import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { styles } from './Register.styles'
import { validerEmail, validerMotDePasse, validerCouleurHex } from '../../utils/validation'


export default function Register() {
  const [erreursMdp, setErreursMdp] = useState([])
  const { login } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    nom: '',
    business_nom: '',
    email: '',
    password: '',
    adresse: '',
    brand_color: '#2A7DE1',
    reward_limit: 10,
    reward_description: '',
  })
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErreur('')

    if (name === 'password') {
      const erreurs = validerMotDePasse(value)
      setErreursMdp(value.length > 0 ? erreurs : [])
    }
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogo(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setErreursMdp([])

    // Validation email
    if (!validerEmail(form.email)) {
      setErreur("Format d'email invalide")
      return
    }

    // Validation mot de passe
    const erreursPwd = validerMotDePasse(form.password)
    if (erreursPwd.length > 0) {
      setErreursMdp(erreursPwd)
      return
    }

    // Validation couleur
    if (!validerCouleurHex(form.brand_color)) {
      setErreur('Couleur hex invalide — format attendu : #RRGGBB')
      return
    }

    setChargement(true)
    try {
      const res = await api.post('/auth/register', {
        ...form,
        reward_limit: parseInt(form.reward_limit),
      })
      login(res.data.access_token, res.data.refresh_token, res.data.pro)

      if (logo) {
        const formData = new FormData()
        formData.append('logo', logo)
        await api.post('/pro/logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      navigate('/dashboard')
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors de la création du compte')
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
            <p style={styles.subtitle}>Créer votre espace commerçant</p>
          </div>
        </div>

        <div style={styles.card}>
          {erreur && <div style={styles.erreur}>{erreur}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Section — Informations personnelles */}
            <div style={styles.sectionTitle}>Informations personnelles</div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Votre nom</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  placeholder="Marie Dubois"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Nom de l'établissement</label>
                <input
                  type="text"
                  name="business_nom"
                  value={form.business_nom}
                  onChange={handleChange}
                  required
                  placeholder="Salon Éclat"
                  style={styles.input}
                />
              </div>
            </div>

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
                  placeholder="Minimum 8 caractères"
                  style={{ ...styles.input, paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
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
              {erreursMdp.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {erreursMdp.map((err, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', color: '#FF8A5B' }}>
                      <span>✕</span><span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Adresse de l'établissement</label>
              <input
                type="text"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                placeholder="123 rue Principale, Victoriaville"
                style={styles.input}
              />
            </div>

            {/* Section — Programme de fidélité */}
            <div style={{ ...styles.sectionTitle, marginTop: '8px' }}>Programme de fidélité</div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Seuil de points</label>
                <input
                  type="number"
                  name="reward_limit"
                  value={form.reward_limit}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description de la récompense</label>
                <input
                  type="text"
                  name="reward_description"
                  value={form.reward_description}
                  onChange={handleChange}
                  placeholder="La 10e coupe est gratuite"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Section — Branding */}
            <div style={{ ...styles.sectionTitle, marginTop: '8px' }}>Apparence de vos cartes</div>

            <div style={styles.field}>
              <label style={styles.label}>Couleur de marque</label>
              <div style={styles.colorRow}>
                <div
                  style={{ ...styles.colorPreview, background: form.brand_color }}
                  onClick={() => document.getElementById('colorPicker').click()}
                />
                <input
                  id="colorPicker"
                  type="color"
                  value={form.brand_color}
                  onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                  style={{ display: 'none' }}
                />
                <input
                  type="text"
                  value={form.brand_color}
                  onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                  placeholder="#2A7DE1"
                  style={styles.colorInput}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Logo de votre établissement</label>
              <div
                style={styles.uploadZone}
                onClick={() => fileRef.current.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={styles.uploadPreview} />
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7A92B4" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={styles.uploadText}>
                      Cliquez pour ajouter votre logo<br />
                      <span style={{ fontSize: '12px' }}>JPG, PNG ou WEBP · Max 5MB</span>
                    </span>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogo}
                style={{ display: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={chargement}
              style={{ ...styles.btn, opacity: chargement ? 0.6 : 1 }}
            >
              {chargement ? 'Création en cours...' : 'Créer mon compte'}
            </button>

          </form>
        </div>

        <p style={styles.footer}>
          Déjà un compte ?{' '}
          <Link to="/login" style={styles.link}>Se connecter</Link>
        </p>

      </div>
    </div>
  )
}
