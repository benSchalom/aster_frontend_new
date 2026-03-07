import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function CarteTag({ type }) {
  const styles = {
    fidelite: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', label: 'Fidélité' },
    abonnement_seances: { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7', label: 'Séances' },
    abonnement_temporel: { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', label: 'Temporel' },
  }
  const s = styles[type] || styles.fidelite
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '11px', fontWeight: '600',
      padding: '3px 10px', borderRadius: '20px',
      letterSpacing: '0.05em', textTransform: 'uppercase'
    }}>{s.label}</span>
  )
}

function BarreProgression({ valeur, max, couleur = '#6366f1' }) {
  const pct = max > 0 ? Math.min((valeur / max) * 100, 100) : 0
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: `linear-gradient(90deg, ${couleur}, ${couleur}bb)`,
        borderRadius: '99px', transition: 'width 0.5s ease'
      }} />
    </div>
  )
}

function CarteFidelite({ carte }) {
  const tamponsMax = carte.tampons_max || 10
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px', padding: '24px',
      transition: 'border-color 0.2s'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {carte.pro_logo && (
            <img src={carte.pro_logo} alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
          )}
          <div>
            <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: 0 }}>{carte.pro_nom || 'Commerçant'}</p>
            <CarteTag type={carte.type} />
          </div>
        </div>
      </div>

      {/* Contenu selon type */}
      {carte.type === 'fidelite' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Tampons</span>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{carte.tampons} / {tamponsMax}</span>
          </div>
          <BarreProgression valeur={carte.tampons} max={tamponsMax} couleur="#6366f1" />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
            {Array.from({ length: tamponsMax }).map((_, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: i < carte.tampons ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${i < carte.tampons ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px'
              }}>{i < carte.tampons ? '★' : ''}</div>
            ))}
          </div>
        </>
      )}

      {carte.type === 'abonnement_seances' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Séances restantes</span>
            <span style={{ color: '#6ee7b7', fontWeight: '700', fontSize: '20px' }}>{carte.seances_restantes}</span>
          </div>
          <BarreProgression valeur={carte.seances_restantes} max={10} couleur="#10b981" />
        </>
      )}

      {carte.type === 'abonnement_temporel' && (
        <>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 6px' }}>Expire le</p>
          <p style={{ color: '#fcd34d', fontWeight: '600', fontSize: '15px', margin: 0 }}>
            {carte.date_expiration ? new Date(carte.date_expiration).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
          </p>
        </>
      )}

      {/* Points */}
      {carte.points > 0 && (
        <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Points accumulés</span>
          <span style={{ color: '#a5b4fc', fontWeight: '600', fontSize: '13px' }}>{carte.points} pts</span>
        </div>
      )}

      {/* Bouton Google Wallet */}
      <a
        href={`${API}${carte.wallet_url}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginTop: '20px', padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', color: 'white',
          fontSize: '13px', fontWeight: '500',
          textDecoration: 'none', transition: 'background 0.2s'
        }}
      >
        <span>🎫</span> Ajouter à Google Wallet
      </a>
    </div>
  )
}

export default function MesCartes() {
  const [cartes, setCartes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('portail_token')
    if (!token) { navigate('/mes-cartes'); return }

    axios.get(`${API}/portail/mes-cartes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setCartes(res.data.cartes))
      .catch(e => {
        if (e.response?.status === 401) {
          localStorage.removeItem('portail_token')
          navigate('/mes-cartes')
        } else {
          setError('Erreur lors du chargement')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('portail_token')
    navigate('/mes-cartes')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B1120',
      fontFamily: "'DM Sans', sans-serif", padding: '24px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

      <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Syne', sans-serif", fontWeight: '800', color: 'white', fontSize: '16px'
            }}>A</div>
            <span style={{ color: 'white', fontFamily: "'Syne', sans-serif", fontWeight: '700', fontSize: '18px' }}>ASTER</span>
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '8px 14px',
            color: 'rgba(255,255,255,0.45)', fontSize: '13px', cursor: 'pointer'
          }}>Déconnexion</button>
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: '800',
          color: 'white', margin: '0 0 6px', letterSpacing: '-0.02em'
        }}>Mes cartes</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', margin: '0 0 28px' }}>
          {loading ? '' : `${cartes.length} carte${cartes.length !== 1 ? 's' : ''} trouvée${cartes.length !== 1 ? 's' : ''}`}
        </p>

        {/* États */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Chargement...</div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px', color: '#fca5a5', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {!loading && !error && cartes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎴</div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Aucune carte associée à ce numéro</p>
          </div>
        )}

        {/* Liste des cartes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartes.map(carte => <CarteFidelite key={carte.id} carte={carte} />)}
        </div>
      </div>
    </div>
  )
}
