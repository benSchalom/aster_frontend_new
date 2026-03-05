import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ProLayout from '../../components/ProLayout'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { styles } from './Profil.styles'
import { colors, font } from '../../utils/theme'
import { validerMotDePasse } from '../../utils/validation'

export default function Profil() {
  const { pro, setPro, logout } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    nom: pro?.nom || '',
    business_nom: pro?.business_nom || '',
    adresse: pro?.adresse || '',
    brand_color: pro?.brand_color || '#2A7DE1',
    reward_limit: pro?.reward_limit || 10,
    reward_description: pro?.reward_description || '',
  })
  const [logoPreview, setLogoPreview] = useState(pro?.logo_url || null)
  const [logo, setLogo] = useState(null)
  const [mdp, setMdp] = useState({ ancien: '', nouveau: '', confirmer: '' })
  const [showMdp, setShowMdp] = useState(false)
  const [succes, setSucces] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [modalFermer, setModalFermer] = useState(false)
  const [confirmTexte, setConfirmTexte] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSucces('')
    setErreur('')
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogo(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSauvegarder = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    setSucces('')
    setErreur('')
    try {
      await api.put('/pro/me', {
        ...form,
        reward_limit: parseInt(form.reward_limit),
      })
      const proRes = await api.get('/pro/me')
      setPro(proRes.data.pro)

      if (logo) {
        const formData = new FormData()
        formData.append('logo', logo)
        await api.post('/pro/logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const proRes = await api.get('/pro/me')
        setPro(proRes.data.pro)
      }

      setSucces('Profil mis à jour avec succès !')
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setEnvoi(false)
    }
  }

  const handleMdp = async (e) => {
    e.preventDefault()
    setSucces('')
    setErreur('')

    const erreursMdp = validerMotDePasse(mdp.nouveau)
    if (erreursMdp.length > 0) {
      setErreur(erreursMdp[0])
      return
    }
    if (mdp.nouveau !== mdp.confirmer) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }

    setEnvoi(true)
    try {
      await api.patch('/pro/password', {
        ancien_password: mdp.ancien,
        nouveau_password: mdp.nouveau,
      })
      setMdp({ ancien: '', nouveau: '', confirmer: '' })
      setSucces('Mot de passe modifié avec succès !')
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors du changement de mot de passe')
    } finally {
      setEnvoi(false)
    }
  }

  const handleFermerCompte = async () => {
    if (confirmTexte !== 'SUPPRIMER MON COMPTE') return
    try {
      await api.delete('/pro/me', {
        data: { confirmation: 'SUPPRIMER MON COMPTE' }
      })
      await logout()
      navigate('/login')
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors de la fermeture du compte')
      setModalFermer(false)
    }
  }

  return (
    <ProLayout title="Profil">
      <div style={styles.container}>

        {succes && <div style={styles.succes}>{succes}</div>}
        {erreur && <div style={styles.erreur}>{erreur}</div>}

        {/* Informations générales */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Informations générales</div>
          <form onSubmit={handleSauvegarder} style={styles.form}>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Votre nom</label>
                <input type="text" name="nom" value={form.nom}
                  onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Nom de l'établissement</label>
                <input type="text" name="business_nom" value={form.business_nom}
                  onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Adresse</label>
              <input type="text" name="adresse" value={form.adresse}
                onChange={handleChange} placeholder="123 rue Principale"
                style={styles.input} />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Seuil de points</label>
                <input type="number" name="reward_limit" value={form.reward_limit}
                  onChange={handleChange} min="1" max="100" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description récompense</label>
                <input type="text" name="reward_description" value={form.reward_description}
                  onChange={handleChange} placeholder="La 10e coupe est gratuite"
                  style={styles.input} />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Couleur de marque</label>
              <div style={styles.colorRow}>
                <div
                  style={{ ...styles.colorPreview, background: form.brand_color }}
                  onClick={() => document.getElementById('colorPicker').click()}
                />
                <input id="colorPicker" type="color" value={form.brand_color}
                  onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                  style={{ display: 'none' }} />
                <input type="text" value={form.brand_color}
                  onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                  style={{ ...styles.input, flex: 1 }} />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Logo</label>
              <div style={styles.uploadZone} onClick={() => fileRef.current.click()}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={styles.uploadPreview} />
                ) : (
                  <span style={styles.uploadText}>Cliquez pour changer le logo</span>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleLogo} style={{ display: 'none' }} />
            </div>

            <button type="submit" disabled={envoi}
              style={{ ...styles.btnPrimary, opacity: envoi ? 0.6 : 1 }}>
              {envoi ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </form>
        </div>

       {/* Mot de passe */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Changer le mot de passe</div>
          <div style={{ fontSize: '18px', color: colors.textMuted }}>
            Cette fonctionnalité sera disponible prochainement.
          </div>
        </div>

        {/* Zone danger */}
        <div style={styles.dangerZone}>
          <div style={styles.dangerTitle}>Zone dangereuse</div>
          <div style={styles.dangerSub}>
            Fermer votre compte supprimera définitivement toutes vos données,
            vos clients seront anonymisés et leurs cartes désactivées.
          </div>
          <button onClick={() => setModalFermer(true)} style={styles.btnDanger}>
            Fermer mon compte
          </button>
        </div>

      </div>

      {/* Modal fermeture compte */}
      {modalFermer && (
        <div style={styles.modalOverlay} onClick={() => setModalFermer(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Fermer mon compte</div>
            <div style={styles.modalSub}>
              Cette action est <strong style={{ color: colors.orangeLight }}>irréversible</strong>.
              Tapez <strong>SUPPRIMER MON COMPTE</strong> pour confirmer.
            </div>
            <input
              type="text"
              value={confirmTexte}
              onChange={(e) => setConfirmTexte(e.target.value)}
              placeholder="SUPPRIMER MON COMPTE"
              style={styles.input}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalFermer(false)} style={{
                padding: '10px 20px', borderRadius: '10px', background: 'none',
                border: '1px solid rgba(91,163,245,0.15)', color: colors.textMuted,
                cursor: 'pointer', fontFamily: font.sans, fontSize: '14px',
              }}>
                Annuler
              </button>
              <button
                onClick={handleFermerCompte}
                disabled={confirmTexte !== 'SUPPRIMER MON COMPTE'}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  background: confirmTexte === 'SUPPRIMER MON COMPTE'
                    ? 'rgba(244,98,42,0.15)' : 'rgba(91,163,245,0.05)',
                  border: '1px solid rgba(244,98,42,0.3)',
                  color: confirmTexte === 'SUPPRIMER MON COMPTE'
                    ? colors.orangeLight : colors.textMuted,
                  cursor: confirmTexte === 'SUPPRIMER MON COMPTE' ? 'pointer' : 'not-allowed',
                  fontFamily: font.sans, fontSize: '14px', fontWeight: '600',
                }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </ProLayout>
  )
}
