import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProLayout from '../../components/ProLayout'
import { useWindowSize } from '../../hooks/useWindowSize'
import api from '../../services/api'
import { styles } from './Clients.styles'
import { colors } from '../../utils/theme'

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
  const { isMobile } = useWindowSize()
  const [clients, setClients] = useState([])
  const [filtre, setFiltre] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [chargement, setChargement] = useState(true)
  const [clientSelectionne, setClientSelectionne] = useState(null)

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get('/pro/clients')
        setClients(res.data.clients || [])
      } catch (_e) {}
      finally { setChargement(false) }
    }
    charger()
  }, [])

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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
    </ProLayout>
  )
}
