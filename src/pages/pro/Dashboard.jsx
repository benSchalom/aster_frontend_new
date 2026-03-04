import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProLayout from '../../components/ProLayout'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { styles } from './Dashboard.styles'
import { colors } from '../../utils/theme'
import { ROUTES } from '../../utils/constants'

const avatarColors = [
  'rgba(42,125,225,0.8)',
  'rgba(244,98,42,0.8)',
  'rgba(20,200,120,0.8)',
  'rgba(160,80,220,0.8)',
  'rgba(255,180,0,0.8)',
]

export default function Dashboard() {
  const { pro } = useAuth()
  const [stats, setStats] = useState(null)
  const [clients, setClients] = useState([])
  const [qrCode, setQrCode] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const charger = async () => {
      try {
        const [statsRes, clientsRes, qrRes] = await Promise.all([
          api.get('/pro/dashboard'),
          api.get('/pro/clients'),
          api.get('/pro/qrcode'),
        ])
        setStats(statsRes.data)
        setClients(clientsRes.data.clients?.slice(0, 5) || [])
        console.log('QR response:', qrRes.data)
        setQrCode(qrRes.data.qr_code)
      } catch (err) {
        console.error('Erreur chargement dashboard', err)
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  if (chargement) {
    return (
      <ProLayout title="Tableau de bord">
        <div style={{ textAlign: 'center', padding: '80px', color: colors.textMuted }}>
          Chargement...
        </div>
      </ProLayout>
    )
  }

  return (
    <ProLayout title="Tableau de bord">

      {/* Stats */}
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon('rgba(42,125,225,0.15)')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A7DE1" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div style={styles.statLabel}>Clients</div>
          <div style={styles.statValue}>{stats?.total_clients ?? 0}</div>
          <div style={styles.statSub}>clients enregistrés</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon('rgba(244,98,42,0.15)')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4622A" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div style={styles.statLabel}>Cartes actives</div>
          <div style={styles.statValue}>{stats?.total_cartes ?? 0}</div>
          <div style={styles.statSub}>
            {stats?.cartes_fidelite ?? 0} fidélité · {stats?.cartes_abonnement ?? 0} abonnement
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon('rgba(20,200,120,0.15)')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14C87A" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div style={styles.statLabel}>Programme</div>
          <div style={styles.statValue}>{pro?.reward_limit ?? 0}</div>
          <div style={styles.statSub}>points pour récompense</div>
        </div>
      </div>

      {/* QR Code */}
      <div style={styles.section}>
        <div style={styles.qrSection}>
          <div style={styles.qrInfo}>
            <div style={styles.qrTitle}>Votre QR Code d'inscription</div>
            <div style={styles.qrSub}>
              Affichez ce code en boutique — vos clients le scannent pour créer leur carte fidélité instantanément.
            </div>
            {qrCode && (
              <a
                href={qrCode}
                download={'qrcode-' + pro?.slug + '.png'}
                style={styles.btnPrimary}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Télécharger
              </a>
            )}
          </div>
          {qrCode && (
            <img
              src={qrCode}
              alt="QR Code"
              style={styles.qrImage}
            />
          )}
        </div>
      </div>

      {/* Derniers clients */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>Derniers clients</div>
          <Link to={ROUTES.CLIENTS} style={styles.seeAll}>Voir tous →</Link>
        </div>

        {clients.length === 0 ? (
          <div style={styles.emptyState}>
            Aucun client pour l'instant — partagez votre QR code !
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clients.map((client, i) => (
              <div key={client.id} style={styles.clientCard}>
                <div style={styles.clientInfo}>
                  <div style={styles.avatar(avatarColors[i % avatarColors.length])}>
                    {client.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.clientName}>{client.full_name}</div>
                    <div style={styles.clientSub}>
                      {client.cartes?.length ?? 0} carte{(client.cartes?.length ?? 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div style={styles.badge('rgba(42,125,225,0.12)', '#5BA3F5')}>
                  {client.cartes?.[0]?.type === 'FIDELITE' ? 'Fidélité' :
                    client.cartes?.[0]?.type === 'ABONNEMENT_SEANCES' ? 'Séances' :
                      client.cartes?.[0]?.type === 'ABONNEMENT_TEMPS' ? 'Temporel' : 'Carte'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </ProLayout>
  )
}