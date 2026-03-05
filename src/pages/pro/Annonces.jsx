import { useState, useEffect } from 'react'
import ProLayout from '../../components/ProLayout'
import api from '../../services/api'
import { styles } from './Annonces.styles'
import { colors, font } from '../../utils/theme'

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-CA', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function Annonces() {
  const [confirmSupprimer, setConfirmSupprimer] = useState(null) // id de l'annonce à supprimer
  const [annonces, setAnnonces] = useState([])
  const [chargement, setChargement] = useState(true)
  const [modal, setModal] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [form, setForm] = useState({
    titre: '',
    contenu: '',
    expires_at: '',
  })

  useEffect(() => {
    charger()
  }, [])

  const charger = async () => {
    try {
      const res = await api.get('/annonces')
      setAnnonces(res.data.annonces || [])
    } catch (_e) {}
    finally { setChargement(false) }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErreur('')
  }

  const supprimerAnnonce = async () => {
    try {
      await api.delete('/annonces/' + confirmSupprimer)
      setConfirmSupprimer(null)
      await charger()
    } catch (_e) {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titre.trim() || !form.contenu.trim()) {
      setErreur('Le titre et le contenu sont requis')
      return
    }
    setEnvoi(true)
    try {
      await api.post('/annonces', {
        titre: form.titre,
        message: form.contenu,
        expires_at: form.expires_at || null,
      })
      setModal(false)
      setForm({ titre: '', contenu: '', expires_at: '' })
      await charger()
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <ProLayout title="Annonces">
      <div style={styles.container}>

        <div style={styles.topBar}>
          <button onClick={() => setModal(true)} style={styles.btnPrimary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvelle annonce
          </button>
        </div>

        {chargement ? (
          <div style={styles.emptyState}>Chargement...</div>
        ) : annonces.length === 0 ? (
          <div style={styles.emptyState}>
            Aucune annonce — créez-en une pour notifier vos clients !
          </div>
        ) : (
          <div style={styles.list}>
            {annonces.map(a => {
              const expire = a.expires_at && new Date(a.expires_at) < new Date()
              return (
                <div key={a.id} style={styles.annonceCard(expire)}>
                  <div style={styles.annonceHeader}>
                    <div style={styles.annonceTitre}>{a.titre}</div>
                    {expire ? (
                      <div style={styles.badge('rgba(244,98,42,0.1)', '#FF8A5B')}>Expirée</div>
                    ) : (
                      <div style={styles.badge('rgba(20,200,120,0.1)', '#4DFFA8')}>Active</div>
                    )}

                    <button
                      onClick={() => setConfirmSupprimer(a.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: colors.textMuted,
                        display: 'flex',
                        padding: '2px',
                      }}
                      title="Supprimer"
                    >
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>

                  </div>
                  <div style={styles.annonceContenu}>{a.contenu}</div>
                  <div style={styles.annonceMeta}>
                    <div style={styles.metaDate}>
                      Envoyée le {formatDate(a.created_at)}
                    </div>
                    {a.expires_at && (
                      <div style={styles.metaDate}>
                        · Expire le {formatDate(a.expires_at)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal confirmation suppression */}
      {confirmSupprimer && (
        <div style={styles.modalOverlay} onClick={() => setConfirmSupprimer(null)}>
          <div style={{ ...styles.modal, maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Supprimer l'annonce ?</div>
              <button onClick={() => setConfirmSupprimer(null)} style={styles.closeBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ fontSize: '14px', color: colors.textMuted, lineHeight: 1.6 }}>
              Cette action est irréversible. L'annonce sera définitivement supprimée.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmSupprimer(null)} style={{
                padding: '10px 20px', borderRadius: '10px', background: 'none',
                border: '1px solid rgba(91,163,245,0.15)', color: colors.textMuted,
                cursor: 'pointer', fontFamily: font.sans, fontSize: '14px',
              }}>
                Annuler
              </button>
              <button onClick={supprimerAnnonce} style={{
                padding: '10px 20px', borderRadius: '10px',
                background: 'rgba(244,98,42,0.15)', border: '1px solid rgba(244,98,42,0.3)',
                color: colors.orangeLight, cursor: 'pointer',
                fontFamily: font.sans, fontSize: '14px', fontWeight: '600',
              }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouvelle annonce */}
      {modal && (
        <div style={styles.modalOverlay} onClick={() => setModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Nouvelle annonce</div>
              <button onClick={() => setModal(false)} style={styles.closeBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {erreur && <div style={styles.erreur}>{erreur}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Titre *</label>
                <input
                  type="text"
                  name="titre"
                  value={form.titre}
                  onChange={handleChange}
                  placeholder="Promotion de printemps !"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Message *</label>
                <textarea
                  name="contenu"
                  value={form.contenu}
                  onChange={handleChange}
                  placeholder="Profitez de 20% de rabais sur tous nos services ce mois-ci..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Date d'expiration (optionnel)</label>
                <input
                  type="date"
                  name="expires_at"
                  value={form.expires_at}
                  onChange={handleChange}
                  style={styles.input}
                />
                <div style={styles.hint}>
                  Sans date — l'annonce reste visible indéfiniment
                </div>
              </div>

              <button
                type="submit"
                disabled={envoi}
                style={{ ...styles.btnSubmit, opacity: envoi ? 0.6 : 1 }}
              >
                {envoi ? 'Envoi en cours...' : 'Envoyer l\'annonce'}
              </button>
            </form>
          </div>
        </div>
      )}
    </ProLayout>
  )
}
