import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProLayout from '../../components/ProLayout'
import { useWindowSize } from '../../hooks/useWindowSize'
import api from '../../services/api'
import { styles } from './Clients.styles'
import { colors } from '../../utils/theme'
import { QRCodeSVG } from 'qrcode.react'

const avatarColors = [
  'rgba(42,125,225,0.8)', 'rgba(244,98,42,0.8)',
  'rgba(20,200,120,0.8)', 'rgba(160,80,220,0.8)',
  'rgba(255,180,0,0.8)',
]

const typeBadge = (type) => {
  if (type === 'FIDELITE') return { bg: 'rgba(42,125,225,0.12)', color: '#5BA3F5', label: 'Fidélité' }
  if (type === 'ABONNEMENT_SEANCES') return { bg: 'rgba(244,98,42,0.12)', color: '#FF8A5B', label: 'Séances' }
  if (type === 'ABONNEMENT_TEMPS') return { bg: 'rgba(20,200,120,0.12)', color: '#4DFFA8', label: 'Temporel' }
  return { bg: 'rgba(91,163,245,0.08)', color: colors.textMuted, label: type }
}

export default function Clients() {
  const [modalAbonnement, setModalAbonnement] = useState(false)
  const [formAbo, setFormAbo] = useState({
    full_name: '',
    phone: '',
    type: 'ABONNEMENT_SEANCES',
    seances_total: 10,
    duree_unite: 'mois',
    duree_valeur: 1,
  })
  const [confirmSupprimerClient, setConfirmSupprimerClient] = useState(null)
  const [envoiAbo, setEnvoiAbo] = useState(false)
  const [resultatAbo, setResultatAbo] = useState(null)
  const [erreurAbo, setErreurAbo] = useState('')
  const { isMobile } = useWindowSize()
  const [clients, setClients] = useState([])
  const [filtre, setFiltre] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(true)
  const [clientSelectionne, setClientSelectionne] = useState(null)

  const charger = async () => {
    try {
      const res = await api.get('/pro/clients')
      setClients(res.data.clients || [])
    } catch (_e) {}
    finally { setChargement(false) }
  }

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return digits.slice(0,3) + '-' + digits.slice(3)
    return digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6)
  }

  const supprimerClient = async () => {
    try {
      await api.delete('/pro/clients/' + confirmSupprimerClient)
      setConfirmSupprimerClient(null)
      setClientSelectionne(null)
      await charger()
    } catch (err) {
      setErreurAbo(err.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  useEffect(() => {
    charger()
  }, [])

  const creerAbonnement = async (e) => {
    e.preventDefault()
    if (!formAbo.full_name.trim()) {
      setErreurAbo('Le nom est requis')
      return
    }
    setEnvoiAbo(true)
    setErreurAbo('')
    try {
      const res = await api.post('/carte/abonnement', formAbo)
      setModalAbonnement(false)
      setFormAbo({
        full_name: '', phone: '', type: 'ABONNEMENT_SEANCES',
        seances_total: 10, duree_unite: 'mois', duree_valeur: 1,
      })
      // Charger le QR code de la carte créée
      const carteRes = await api.get('/carte/' + res.data.carte.serial_number)
      setResultatAbo({
        serial: res.data.carte.serial_number,
        qr_code: carteRes.data.qr_code,
        client_nom: formAbo.full_name,
        type: formAbo.type,
      })
      await charger()
    } catch (err) {
      setErreurAbo(err.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setEnvoiAbo(false)
    }
  }

  const clientsFiltres = clients.filter(c => {
    const nom = c.full_name?.toLowerCase() || ''
    const phone = c.phone || ''
    const matchRecherche = nom.includes(recherche.toLowerCase()) ||
      phone.includes(recherche)
    const carte = c.cartes?.[0]
    const matchFiltre = filtre === 'TOUS' ||
      (filtre === 'FIDELITE' && carte?.type === 'FIDELITE') ||
      (filtre === 'ABONNEMENT' && (
        carte?.type === 'ABONNEMENT_SEANCES' || carte?.type === 'ABONNEMENT_TEMPS'
      ))
    return matchRecherche && matchFiltre
  })

  return (
    <ProLayout title="Clients">
      <div style={styles.container}>

        {/* Barre de recherche + filtres */}
        <div style={styles.topBar}>
          <div style={styles.searchWrapper}>
            <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          {['TOUS', 'FIDELITE', 'ABONNEMENT'].map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={styles.filterBtn(filtre === f)}>
              {f === 'TOUS' ? 'Tous' : f === 'FIDELITE' ? 'Fidélité' : 'Abonnements'}
            </button>
          ))}
          <button onClick={() => setModalAbonnement(true)} style={styles.filterBtn(false)}>
            + Nouvelle carte
          </button>
        </div>

        <div style={styles.count}>
          {clientsFiltres.length} client{clientsFiltres.length > 1 ? 's' : ''}
        </div>

        {/* Liste */}
        {chargement ? (
          <div style={styles.emptyState}>Chargement...</div>
        ) : clientsFiltres.length === 0 ? (
          <div style={styles.emptyState}>Aucun client trouvé</div>
        ) : (
          <div style={styles.table}>
            {clientsFiltres.map((client, i) => {
              const carte = client.cartes?.[0]
              const badge = carte ? typeBadge(carte.type) : null

              if (isMobile) {
                return (
                  <div key={client.id} style={styles.rowMobile}
                    onClick={() => setClientSelectionne(client)}>
                    <div style={styles.avatar(avatarColors[i % avatarColors.length])}>
                      {client.full_name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.clientName}>{client.full_name}</div>
                      <div style={styles.clientPhone}>{client.phone || 'Aucun téléphone'}</div>
                    </div>
                    {badge && (
                      <div style={styles.badge(badge.bg, badge.color)}>{badge.label}</div>
                    )}
                  </div>
                )
              }

              return (
                <div key={client.id} style={styles.row}
                  onClick={() => setClientSelectionne(client)}>
                  <div style={styles.avatar(avatarColors[i % avatarColors.length])}>
                    {client.full_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.clientName}>{client.full_name}</div>
                    <div style={styles.clientPhone}>{client.phone || '—'}</div>
                  </div>
                  <div>
                    {badge && <div style={styles.badge(badge.bg, badge.color)}>{badge.label}</div>}
                  </div>
                  <div>
                    {carte?.type === 'FIDELITE' && (
                      <>
                        <div style={styles.points}>{carte.points_count} pts</div>
                        <div style={styles.pointsSub}>/ {carte.reward_limit}</div>
                      </>
                    )}
                    {carte?.type === 'ABONNEMENT_SEANCES' && (
                      <>
                        <div style={styles.points}>{carte.seances_restantes}</div>
                        <div style={styles.pointsSub}>séances</div>
                      </>
                    )}
                    {carte.type === 'ABONNEMENT_TEMPS' && (
                      <>
                        <div style={styles.points}>
                          {carte.abonnement_fin
                            ? new Date(carte.abonnement_fin).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
                            : '—'}
                        </div>
                        <div style={styles.pointsSub}>expiration</div>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A92B4" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {modalAbonnement && (
          <div style={styles.modalOverlay} onClick={() => setModalAbonnement(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>Nouvelle carte abonnement</div>
                <button onClick={() => setModalAbonnement(false)} style={styles.closeBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {erreurAbo && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(244,98,42,0.1)', border: '1px solid rgba(244,98,42,0.3)', color: '#FF8A5B', fontSize: '13px' }}>{erreurAbo}</div>}

              <form onSubmit={creerAbonnement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.carteInfo}>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '4px' }}>Client</div>
                  <input
                    type="text"
                    placeholder="Nom complet *"
                    value={formAbo.full_name}
                    onChange={e => setFormAbo({ ...formAbo, full_name: e.target.value })}
                    style={{ ...styles.carteValue, background: 'rgba(91,163,245,0.05)', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: colors.text, fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '8px' }}
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone (optionnel)"
                    value={formAbo.phone}
                    onChange={e => setFormAbo({ ...formAbo, phone: formatPhone(e.target.value) })}
                    style={{ background: 'rgba(91,163,245,0.05)', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: colors.text, fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={styles.carteInfo}>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px' }}>Type d'abonnement</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['ABONNEMENT_SEANCES', 'ABONNEMENT_TEMPS'].map(t => (
                      <button key={t} type="button"
                        onClick={() => setFormAbo({ ...formAbo, type: t })}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                          background: formAbo.type === t ? 'rgba(244,98,42,0.15)' : 'rgba(91,163,245,0.05)',
                          border: formAbo.type === t ? '1px solid rgba(244,98,42,0.3)' : '1px solid rgba(91,163,245,0.15)',
                          color: formAbo.type === t ? '#FF8A5B' : colors.textMuted,
                          fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                        }}>
                        {t === 'ABONNEMENT_SEANCES' ? 'Séances' : 'Temporel'}
                      </button>
                    ))}
                  </div>
                </div>

                {formAbo.type === 'ABONNEMENT_SEANCES' && (
                  <div style={styles.carteInfo}>
                    <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px' }}>Nombre de séances</div>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formAbo.seances_total}
                      onChange={e => setFormAbo({ ...formAbo, seances_total: parseInt(e.target.value) })}
                      style={{ background: 'rgba(91,163,245,0.05)', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: colors.text, fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                )}

                {formAbo.type === 'ABONNEMENT_TEMPS' && (
                  <div style={styles.carteInfo}>
                    <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px' }}>Durée</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        value={formAbo.duree_valeur}
                        onChange={e => setFormAbo({ ...formAbo, duree_valeur: parseInt(e.target.value) })}
                        style={{ flex: 1, background: 'rgba(91,163,245,0.05)', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: colors.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                      <select
                        value={formAbo.duree_unite}
                        onChange={e => setFormAbo({ ...formAbo, duree_unite: e.target.value })}
                        style={{ flex: 1, background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: colors.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                      >
                        <option value="jour">Jours</option>
                        <option value="semaine">Semaines</option>
                        <option value="mois">Mois</option>
                        <option value="annee">Ans</option>
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={envoiAbo}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: colors.blue, color: 'white', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: envoiAbo ? 0.6 : 1 }}>
                  {envoiAbo ? 'Création en cours...' : 'Créer la carte'}
                </button>
              </form>
            </div>
          </div>
        )}

        {resultatAbo && (
          <div style={styles.modalOverlay} onClick={() => setResultatAbo(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitle}>Carte créée ✅</div>
                <button onClick={() => setResultatAbo(null)} style={styles.closeBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: colors.textMuted }}>
                  Faites scanner ce code par <strong style={{ color: colors.text }}>{resultatAbo.client_nom}</strong>
                </div>

                <div style={{ background: 'white', padding: '16px', borderRadius: '12px' }}>
                  <QRCodeSVG
                    value={`${window.location.origin}/carte/${resultatAbo.serial}`}
                    size={200}
                  />
                </div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>
                  Ce QR code ouvre la carte sur le téléphone du client
                </div>

                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: colors.textMuted }}>
                  {resultatAbo.serial}
                </div>

                <div style={{ fontSize: '13px', color: colors.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
                  Le client peut accéder à sa carte via :<br/>
                  <strong style={{ color: colors.text }}>
                    {window.location.origin}/carte/{resultatAbo.serial}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => setResultatAbo(null)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: colors.blue, color: 'white', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal détail client */}
      {clientSelectionne && (
        <div style={styles.modalOverlay} onClick={() => setClientSelectionne(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{clientSelectionne.full_name}</div>
              <button onClick={() => setClientSelectionne(null)} style={styles.closeBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={styles.carteInfo}>
              <div style={styles.carteRow}>
                <span style={styles.carteLabel}>Téléphone</span>
                <span style={styles.carteValue}>{clientSelectionne.phone || '—'}</span>
              </div>
              {clientSelectionne.cartes?.map(carte => {
                const badge = typeBadge(carte.type)
                return (
                  <div key={carte.serial_number}>
                    <div style={styles.carteRow}>
                      <span style={styles.carteLabel}>Type de carte</span>
                      <div style={styles.badge(badge.bg, badge.color)}>{badge.label}</div>
                    </div>
                    <div style={styles.carteRow}>
                      <span style={styles.carteLabel}>Serial</span>
                      <span style={{ ...styles.carteValue, fontFamily: 'monospace', fontSize: '12px' }}>
                        {carte.serial_number}
                      </span>
                    </div>
                    {carte.type === 'FIDELITE' && (
                      <div style={styles.carteRow}>
                        <span style={styles.carteLabel}>Points</span>
                        <span style={styles.carteValue}>{carte.points_count} / {carte.reward_limit}</span>
                      </div>
                    )}
                    {carte.type === 'ABONNEMENT_SEANCES' && (
                      <div style={styles.carteRow}>
                        <span style={styles.carteLabel}>Séances restantes</span>
                        <span style={styles.carteValue}>{carte.seances_restantes}</span>
                      </div>
                    )}
                    {carte.type === 'ABONNEMENT_TEMPS' && (
                      <div style={styles.carteRow}>
                        <span style={styles.carteLabel}>Expiration</span>
                        <span style={styles.carteValue}>
                          {carte.abonnement_fin
                            ? new Date(carte.abonnement_fin).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <button
                onClick={() => setConfirmSupprimerClient(clientSelectionne.id)}
                style={styles.btnDanger}
              >
                Supprimer
              </button>
              <Link
                to={'/carte/' + clientSelectionne.cartes?.[0]?.serial_number}
                target="_blank"
                style={styles.btnPrimary}
              >
                Voir la carte
              </Link>
            </div>
          </div>
        </div>
      )}

      {confirmSupprimerClient && (
        <div style={styles.modalOverlay} onClick={() => setConfirmSupprimerClient(null)}>
          <div style={{ ...styles.modal, maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Supprimer ce client ?</div>
            <div style={{ fontSize: '14px', color: colors.textMuted, lineHeight: 1.6 }}>
              Le client sera anonymisé et ses cartes désactivées. Cette action est irréversible.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmSupprimerClient(null)} style={{
                padding: '10px 20px', borderRadius: '10px', background: 'none',
                border: '1px solid rgba(91,163,245,0.15)', color: colors.textMuted,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
              }}>
                Annuler
              </button>
              <button onClick={supprimerClient} style={{
                padding: '10px 20px', borderRadius: '10px',
                background: 'rgba(244,98,42,0.15)', border: '1px solid rgba(244,98,42,0.3)',
                color: '#FF8A5B', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '14px', fontWeight: '600',
              }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </ProLayout>
  )
}
