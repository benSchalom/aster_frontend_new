import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import ProLayout from '../../components/ProLayout'
import api from '../../services/api'
import { styles } from './Scanner.styles'
import { colors } from '../../utils/theme'

export default function Scanner() {
  const [scanning, setScanning] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [erreur, setErreur] = useState('')
  const [serialManuel, setSerialManuel] = useState('')
  const [chargement, setChargement] = useState(false)
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const demarrerScan = async () => {
    setErreur('')
    setResultat(null)
    try {
      html5QrRef.current = new Html5Qrcode('scanner-qr')
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          arreterScan()
          traiterScan(decodedText)
        },
        () => {}
      )
      setScanning(true)
    } catch (err) {
      setErreur('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
    }
  }

  const arreterScan = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop()
      } catch (_e) {}
    }
    setScanning(false)
  }

  const traiterScan = async (serial) => {
    setChargement(true)
    setErreur('')
    try {
      const res = await api.post('/carte/scan', { serial_number: serial })
      setResultat({ ...res.data, serial })
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors du scan'
      setErreur(msg)
      setResultat({ type: 'error', message: msg })
    } finally {
      setChargement(false)
    }
  }

  const handleManuel = async (e) => {
    e.preventDefault()
    if (!serialManuel.trim()) return
    await traiterScan(serialManuel.trim())
    setSerialManuel('')
  }

  const reinitialiser = () => {
    setResultat(null)
    setErreur('')
  }

  return (
    <ProLayout title="Scanner">
      <div style={styles.container}>

        {/* Scanner caméra */}
        <div style={styles.scannerBox}>
          <div id="scanner-qr" ref={scannerRef} style={styles.scannerInner} />

          {!scanning && (
            <div style={styles.scannerOverlay}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7A92B4" strokeWidth="1.5">
                <polyline points="23 6 23 1 18 1"/><line x1="23" y1="1" x2="14" y2="10"/>
                <polyline points="1 6 1 1 6 1"/><line x1="1" y1="1" x2="10" y2="10"/>
                <polyline points="23 18 23 23 18 23"/><line x1="23" y1="23" x2="14" y2="14"/>
                <polyline points="1 18 1 23 6 23"/><line x1="1" y1="23" x2="10" y2="14"/>
              </svg>
              <p style={styles.scannerOverlayText}>
                Pointez la caméra vers le QR code de la carte client
              </p>
              <button onClick={demarrerScan} style={styles.btnPrimary}>
                Démarrer le scan
              </button>
            </div>
          )}
        </div>

        {scanning && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={arreterScan} style={styles.btnDanger}>
              Arrêter le scan
            </button>
          </div>
        )}

        {/* Résultat */}
        {chargement && (
          <div style={{ textAlign: 'center', color: colors.textMuted, padding: '20px' }}>
            Traitement en cours...
          </div>
        )}

        {resultat && !chargement && (
          <div style={styles.resultCard(resultat.success ? 'success' : 'error')}>
            <div style={styles.resultHeader}>
              <div style={styles.resultIcon(resultat.success ? 'success' : 'error')}>
                {resultat.success ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14C87A" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4622A" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                )}
              </div>
              <div>
                <div style={styles.resultTitle}>
                  {resultat.success ? resultat.client_nom || 'Scan réussi' : 'Échec du scan'}
                </div>
                <div style={styles.resultSub}>
                  {resultat.success ? resultat.type_carte : resultat.message}
                </div>
              </div>
            </div>

            {resultat.success && (
              <>
                <div style={styles.pointsDisplay}>
                  {resultat.type_carte === 'FIDELITE' && (
                    <>
                      <div style={styles.pointBadge('rgba(42,125,225,0.1)')}>
                        <div style={styles.pointValue}>{resultat.points_count}</div>
                        <div style={styles.pointLabel}>Points actuels</div>
                      </div>
                      <div style={styles.pointBadge('rgba(91,163,245,0.08)')}>
                        <div style={styles.pointValue}>{resultat.reward_limit}</div>
                        <div style={styles.pointLabel}>Seuil récompense</div>
                      </div>
                    </>
                  )}
                  {resultat.type_carte === 'ABONNEMENT_SEANCES' && (
                    <>
                      <div style={styles.pointBadge('rgba(244,98,42,0.1)')}>
                        <div style={styles.pointValue}>{resultat.seances_utilisees}</div>
                        <div style={styles.pointLabel}>Séances utilisées</div>
                      </div>
                      <div style={styles.pointBadge('rgba(91,163,245,0.08)')}>
                        <div style={styles.pointValue}>{resultat.seances_restantes}</div>
                        <div style={styles.pointLabel}>Séances restantes</div>
                      </div>
                    </>
                  )}
                </div>

                {resultat.reward_disponible && (
                  <div style={styles.rewardBanner}>
                    <span style={{ fontSize: '24px' }}>🎉</span>
                    Récompense disponible — {resultat.reward_description}
                  </div>
                )}
              </>
            )}

            <button onClick={reinitialiser} style={styles.btnPrimary}>
              Nouveau scan
            </button>
          </div>
        )}

        {/* Saisie manuelle */}
        <div style={styles.manualSection}>
          <div style={styles.manualTitle}>Saisie manuelle du serial</div>
          <form onSubmit={handleManuel} style={styles.manualRow}>
            <input
              type="text"
              value={serialManuel}
              onChange={(e) => setSerialManuel(e.target.value)}
              placeholder="ASTER-1-1-abc123"
              style={styles.input}
            />
            <button type="submit" style={styles.btnPrimary}>
              Scanner
            </button>
          </form>
        </div>

      </div>
    </ProLayout>
  )
}
