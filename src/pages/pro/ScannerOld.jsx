import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import ProLayout from '../../components/ProLayout'
import api from '../../services/api'
import { styles } from './Scanner.styles'
import { colors } from '../../utils/theme'

export default function Scanner() {
  const [scanning, setScanning] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [serialARenouveler, setSerialARenouveler] = useState(null)
  const [modalRenouveler, setModalRenouveler] = useState(null) // { serial, type }
  const [formRenouveler, setFormRenouveler] = useState({ seances_total: 10, duree_unite: 'mois', duree_valeur: 1 })
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

    // Demander permission caméra explicitement d'abord
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    } catch (err) {
      setErreur('Permission caméra refusée. Allez dans les paramètres du navigateur pour l\'autoriser.')
      return
    }

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

  const renouvelerCarte = async (e) => {
    e.preventDefault()
    setChargement(true)
    try {
      const body = modalRenouveler.type === 'ABONNEMENT_SEANCES'
        ? { seances_total: formRenouveler.seances_total }
        : { duree_unite: formRenouveler.duree_unite, duree_valeur: formRenouveler.duree_valeur }
      
      await api.post('/carte/' + modalRenouveler.serial + '/renouveler', body)
      setModalRenouveler(null)
      setResultat({ success: true, message: 'Abonnement renouvelé avec succès !' })
    } catch (err) {
      setErreur(err.response?.data?.error || 'Erreur lors du renouvellement')
    } finally {
      setChargement(false)
    }
  }

  const traiterScan = async (serial) => {
    setChargement(true)
    setErreur('')
    try {
      const res = await api.post('/carte/scan', { serial_number: serial })
      setResultat({ ...res.data, serial })
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.error || 'Erreur lors du scan'
      if (status === 410) {
        const type = serial.includes('-') ? null : null
        setResultat({ type: 'error', message: msg, peutRenouveler: true, serial })
      } else {
        setResultat({ type: 'error', message: msg })
      }
      setChargement(false)
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

            {modalRenouveler && (
              <div style={styles.scannerBox} onClick={() => setModalRenouveler(null)}>
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}
                  onClick={() => setModalRenouveler(null)}>
                  <div style={{ background: '#131C2E', border: '1px solid rgba(91,163,245,0.12)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>Renouveler l'abonnement</div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['ABONNEMENT_SEANCES', 'ABONNEMENT_TEMPS'].map(t => (
                        <button key={t} type="button"
                          onClick={() => setModalRenouveler({ ...modalRenouveler, type: t })}
                          style={{
                            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            background: modalRenouveler.type === t ? 'rgba(244,98,42,0.15)' : 'rgba(91,163,245,0.05)',
                            border: modalRenouveler.type === t ? '1px solid rgba(244,98,42,0.3)' : '1px solid rgba(91,163,245,0.15)',
                            color: modalRenouveler.type === t ? '#FF8A5B' : '#7A92B4',
                            fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                          }}>
                          {t === 'ABONNEMENT_SEANCES' ? 'Séances' : 'Temporel'}
                        </button>
                      ))}
                    </div>

                    {modalRenouveler.type === 'ABONNEMENT_SEANCES' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', color: '#7A92B4' }}>Nombre de séances</label>
                        <input type="number" min="1" value={formRenouveler.seances_total}
                          onChange={e => setFormRenouveler({ ...formRenouveler, seances_total: parseInt(e.target.value) })}
                          style={{ background: 'rgba(91,163,245,0.05)', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    )}

                    {modalRenouveler.type === 'ABONNEMENT_TEMPS' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="number" min="1" value={formRenouveler.duree_valeur}
                          onChange={e => setFormRenouveler({ ...formRenouveler, duree_valeur: parseInt(e.target.value) })}
                          style={{ flex: 1, background: 'rgba(91,163,245,0.05)', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                        />
                        <select value={formRenouveler.duree_unite}
                          onChange={e => setFormRenouveler({ ...formRenouveler, duree_unite: e.target.value })}
                          style={{ flex: 1, background: '#0B1120', border: '1px solid rgba(91,163,245,0.15)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}>
                          <option value="jour">Jours</option>
                          <option value="semaine">Semaines</option>
                          <option value="mois">Mois</option>
                          <option value="annee">Ans</option>
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => setModalRenouveler(null)} style={{
                        flex: 1, padding: '12px', borderRadius: '10px', background: 'none',
                        border: '1px solid rgba(91,163,245,0.15)', color: '#7A92B4',
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
                      }}>
                        Annuler
                      </button>
                      <button onClick={renouvelerCarte} style={{
                        flex: 1, padding: '12px', borderRadius: '10px',
                        background: '#2A7DE1', color: 'white',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: '14px', fontWeight: '600',
                      }}>
                        Renouveler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {resultat?.peutRenouveler && (
              <button
                onClick={() => setModalRenouveler({ serial: resultat.serial, type: 'ABONNEMENT_SEANCES' })}
                style={{ ...styles.btnPrimary, background: 'rgba(244,98,42,0.15)', border: '1px solid rgba(244,98,42,0.3)', color: '#FF8A5B' }}
              >
                Renouveler l'abonnement
              </button>
            )}
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
            <button type="submit" style={{ ...styles.btnPrimary, width: '100%' }}>
              Scanner
            </button>
          </form>
        </div>

      </div>
    </ProLayout>
  )
}
