import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import { styles } from './CarteClient.styles'
import { colors } from '../../utils/theme'

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
}

const joursRestants = (iso) => {
  if (!iso) return 0
  const diff = new Date(iso) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function CarteClient() {
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const { serial } = useParams()
  const [carte, setCarte] = useState(null)
  const [walletUrl, setWalletUrl] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const charger = async () => {
      try {
        const [carteRes, walletRes] = await Promise.all([
          api.get('/carte/' + serial),
          api.get('/wallet/create-pass/' + serial),
        ])

        // Le backend retourne carte, pro et client séparément
        const data = carteRes.data
        setCarte({
          ...data.carte,
          client_nom: data.client?.full_name || data.carte?.client_nom,
          reward_disponible: data.carte?.reward_available || data.carte?.reward_disponible,
          reward_limit: data.carte?.reward_limit || data.pro?.reward_limit,
          reward_description: data.carte?.reward_description || data.pro?.reward_description,
          pro: data.carte?.pro || data.pro,
          qr_code: data.qr_code || data.carte?.qr_code,
          historique: data.carte?.historique || data.historique || [],
        })
        setWalletUrl(walletRes.data.save_url)
      } catch (_e) {
        setCarte(null)
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [serial])

  useEffect(() => {
    // Android/Chrome — prompt natif
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS — guide manuel
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    if (isIOS && !isStandalone) {
      setShowInstallBanner(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android — prompt natif
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    }
  }

  if (chargement) {
    return (
      <div style={styles.page}>
        <div style={{ color: '#7A92B4' }}>Chargement de votre carte...</div>
      </div>
    )
  }

  if (!carte) {
    return (
      <div style={styles.page}>
        <div style={{ color: '#7A92B4', textAlign: 'center' }}>
          Carte introuvable ou désactivée.
        </div>
      </div>
    )
  }

  const { pro } = carte

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>

        {/* ─── Carte visuelle ─── */}
        {carte.type === 'FIDELITE' && (
          <div style={styles.cardFidelite()}>
            <div style={styles.cardOrb('rgba(42,125,225,0.25)')} />

            <div style={styles.cardTop}>
              <div style={styles.cardBusiness}>
                {pro?.logo_url ? (
                  <img src={pro.logo_url} alt={pro.business_nom} style={styles.cardLogo} />
                ) : (
                  <div style={styles.cardLogoFallback}>
                    {pro?.business_nom?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={styles.cardBusinessName}>{pro?.business_nom}</div>
                  {pro?.adresse && <div style={styles.cardBusinessAddr}>{pro.adresse}</div>}
                </div>
              </div>
              <div style={styles.typeBadge('rgba(244,98,42,0.2)', '#FF8A5B')}>Fidélité</div>
            </div>

            <div style={styles.pointsSection}>
              <div style={styles.pointsLabel}>Points accumulés</div>
              <div style={styles.pointsDots}>
                {Array.from({ length: carte.reward_limit }).map((_, i) => (
                  <div key={i} style={styles.dot(i < carte.points_count)} />
                ))}
              </div>
              <div style={styles.pointsCount}>
                <strong style={{ color: 'white' }}>{carte.points_count}</strong>
                {' / '}{carte.reward_limit} points · {pro?.reward_description}
              </div>
            </div>

            {carte.reward_disponible && (
              <div style={styles.rewardBanner}>
                <span style={{ fontSize: '20px' }}>🎉</span>
                Récompense disponible !
              </div>
            )}

            <div style={styles.divider} />

            <div style={styles.cardBottom}>
              <div>
                <div style={styles.clientLabel}>Titulaire</div>
                <div style={styles.clientName}>{carte.client_nom}</div>
                <div style={styles.serial}>{carte.serial_number}</div>
              </div>
              {carte.qr_code && (
                <div style={styles.qrBox}>
                  <img src={carte.qr_code} alt="QR" style={styles.qrImg} />
                </div>
              )}
            </div>
          </div>
        )}

        {carte.type === 'ABONNEMENT_SEANCES' && (
          <div style={styles.cardAbonnement}>
            <div style={styles.cardOrb('rgba(244,98,42,0.2)')} />

            <div style={styles.cardTop}>
              <div style={styles.cardBusiness}>
                {pro?.logo_url ? (
                  <img src={pro.logo_url} alt={pro.business_nom} style={styles.cardLogo} />
                ) : (
                  <div style={styles.cardLogoFallback}>
                    {pro?.business_nom?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={styles.cardBusinessName}>{pro?.business_nom}</div>
                  {pro?.adresse && <div style={styles.cardBusinessAddr}>{pro.adresse}</div>}
                </div>
              </div>
              <div style={styles.typeBadge('rgba(244,98,42,0.2)', '#FF8A5B')}>Abonnement</div>
            </div>

            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <div style={styles.progressLabel}>Séances utilisées</div>
                <div style={styles.progressCount}>
                  {carte.seances_utilisees}
                  <span style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}>
                    {' / '}{carte.seances_total}
                  </span>
                </div>
              </div>
              <div style={styles.progressBarBg}>
                <div style={styles.progressBarFill(
                  Math.round((carte.seances_utilisees / carte.seances_total) * 100)
                )} />
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                <strong style={{ color: '#FF8A5B' }}>
                  {carte.seances_total - carte.seances_utilisees} séances restantes
                </strong>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.cardBottom}>
              <div>
                <div style={styles.clientLabel}>Titulaire</div>
                <div style={styles.clientName}>{carte.client_nom}</div>
                <div style={styles.serial}>{carte.serial_number}</div>
              </div>
              {carte.qr_code && (
                <div style={styles.qrBox}>
                  <img src={carte.qr_code} alt="QR" style={styles.qrImg} />
                </div>
              )}
            </div>
          </div>
        )}

        {carte.type === 'ABONNEMENT_TEMPS' && (
          <div style={styles.cardTemps}>
            <div style={styles.cardOrb('rgba(20,200,120,0.15)')} />

            <div style={styles.cardTop}>
              <div style={styles.cardBusiness}>
                {pro?.logo_url ? (
                  <img src={pro.logo_url} alt={pro.business_nom} style={styles.cardLogo} />
                ) : (
                  <div style={styles.cardLogoFallback}>
                    {pro?.business_nom?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={styles.cardBusinessName}>{pro?.business_nom}</div>
                  {pro?.adresse && <div style={styles.cardBusinessAddr}>{pro.adresse}</div>}
                </div>
              </div>
              <div style={styles.typeBadge('rgba(20,200,120,0.15)', '#4DFFA8')}>Temporel</div>
            </div>

            <div style={styles.expirySection}>
              <div style={styles.expiryLabel}>Valide jusqu'au</div>
              <div style={styles.expiryDate}>{formatDate(carte.abonnement_fin)}</div>
              <div style={styles.expiryRemaining}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#4DFFA8', animation: 'pulse 2s infinite'
                }} />
                {joursRestants(carte.abonnement_fin)} jours restants
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.cardBottom}>
              <div>
                <div style={styles.clientLabel}>Titulaire</div>
                <div style={styles.clientName}>{carte.client_nom}</div>
                <div style={styles.serial}>{carte.serial_number}</div>
              </div>
              {carte.qr_code && (
                <div style={styles.qrBox}>
                  <img src={carte.qr_code} alt="QR" style={styles.qrImg} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bouton Google Wallet */}
        {walletUrl && (
          <a href={walletUrl} target="_blank" rel="noreferrer" style={styles.walletBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Ajouter à Google Wallet
          </a>
        )}

        {/* Banniere d'installation */}
        {showInstallBanner && (
          <div style={{
            background: 'rgba(42,125,225,0.1)',
            border: '1px solid rgba(42,125,225,0.2)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
              📲 Installer sur votre écran d'accueil
            </div>
            {deferredPrompt ? (
              // Android
              <div style={{ fontSize: '13px', color: colors.textMuted }}>
                Accédez à votre carte rapidement depuis votre écran d'accueil.
              </div>
            ) : (
              // iOS
              <div style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.5 }}>
                Appuyez sur <strong style={{ color: colors.text }}>Partager</strong> puis{' '}
                <strong style={{ color: colors.text }}>"Sur l'écran d'accueil"</strong>.
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInstallBanner(false)} style={{
                background: 'none', border: 'none', color: colors.textMuted,
                cursor: 'pointer', fontSize: '13px',
              }}>
                Fermer
              </button>
              {deferredPrompt && (
                <button onClick={handleInstall} style={{
                  background: colors.blue, border: 'none', color: 'white',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  padding: '6px 14px', borderRadius: '8px',
                }}>
                  Installer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Historique */}
        {carte.historique?.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Historique</div>
            {carte.historique.slice(0, 5).map((h) => (
              <div key={h.id} style={styles.historiqueItem}>
                <div>
                  <div style={styles.historiqueAction}>
                    {h.action_type === 'ADD_POINT' ? 'Point ajouté' :
                     h.action_type === 'REDEEM' ? 'Récompense utilisée' :
                     h.action_type === 'USE_SEANCE' ? 'Séance utilisée' :
                     h.action_type === 'MANUAL_ADJUST' ? 'Ajustement manuel' :
                     h.action_type}
                  </div>
                  <div style={styles.historiqueDate}>{formatDate(h.created_at)}</div>
                </div>
                <div style={styles.historiqueBadge(h.action_type)}>
                  {h.valeur_avant} → {h.valeur_apres}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
