import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWindowSize } from '../hooks/useWindowSize'
import { ROUTES } from '../utils/constants'
import { colors, fontSize, spacing, radius, font } from '../utils/theme'

const navItems = [
  {
    label: 'Tableau de bord',
    labelCourt: 'Accueil',
    path: ROUTES.DASHBOARD,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Clients',
    labelCourt: 'Clients',
    path: ROUTES.CLIENTS,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Scanner',
    labelCourt: 'Scanner',
    path: ROUTES.SCANNER,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 23 1 18 1"/><line x1="23" y1="1" x2="14" y2="10"/>
        <polyline points="1 6 1 1 6 1"/><line x1="1" y1="1" x2="10" y2="10"/>
        <polyline points="23 18 23 23 18 23"/><line x1="23" y1="23" x2="14" y2="14"/>
        <polyline points="1 18 1 23 6 23"/><line x1="1" y1="23" x2="10" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'Annonces',
    labelCourt: 'Annonces',
    path: ROUTES.ANNONCES,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    label: 'Profil',
    labelCourt: 'Profil',
    path: ROUTES.PROFIL,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function ProLayout({ children, title }) {
  const { pro, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { isMobile } = useWindowSize()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const activeRoute = navItems.find(item => item.path === location.pathname)

  // ─── MOBILE — Bottom Navigation ──────────────────────
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: colors.bg,
        fontFamily: font.sans,
        paddingBottom: '70px',
      }}>
        {/* Topbar mobile */}
        <div style={{
          padding: `${spacing.md}px ${spacing.lg}px`,
          background: colors.surface,
          borderBottom: `1px solid rgba(91,163,245,0.08)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            {pro?.logo_url ? (
              <img src={pro.logo_url} alt={pro.business_nom}
                style={{ width: '32px', height: '32px', borderRadius: radius.sm, objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '32px', height: '32px', borderRadius: radius.sm,
                background: colors.blue, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: font.weight.bold,
                fontSize: fontSize.sm,
              }}>
                {pro?.business_nom?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
            <span style={{ fontSize: fontSize.md, fontWeight: font.weight.bold, color: colors.text }}>
              {title || activeRoute?.label || 'ASTER'}
            </span>
          </div>
          <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
            {pro?.nom}
          </span>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, padding: spacing.md }}>
          {children}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: colors.surface,
          borderTop: `1px solid rgba(91,163,245,0.08)`,
          display: 'flex',
          zIndex: 10,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: `${spacing.sm}px 0`,
                  textDecoration: 'none',
                  color: active ? colors.blue : colors.textMuted,
                  gap: '3px',
                }}
              >
                {item.icon}
                <span style={{ fontSize: '10px', fontWeight: active ? font.weight.semibold : font.weight.regular }}>
                  {item.labelCourt}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── DESKTOP — Sidebar ────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: font.sans,
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: colors.surface,
        borderRight: `1px solid rgba(91,163,245,0.08)`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 10,
      }}>
        <div style={{
          padding: `${spacing.xl}px ${spacing.lg}px ${spacing.lg}px`,
          borderBottom: `1px solid rgba(91,163,245,0.08)`,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
        }}>
          {pro?.logo_url ? (
            <img src={pro.logo_url} alt={pro.business_nom}
              style={{ width: '36px', height: '36px', borderRadius: radius.md, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '36px', height: '36px', borderRadius: radius.md,
              background: colors.blue, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: font.weight.bold,
              fontSize: fontSize.md, flexShrink: 0,
            }}>
              {pro?.business_nom?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: fontSize.sm, fontWeight: font.weight.semibold,
              color: colors.text, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {pro?.business_nom || 'ASTER'}
            </div>
            <div style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: '2px' }}>
              Espace commerçant
            </div>
          </div>
        </div>

        <nav style={{
          flex: 1, padding: `${spacing.md}px ${spacing.sm}px`,
          display: 'flex', flexDirection: 'column', gap: '2px',
        }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing.md,
                  padding: `${spacing.sm + 2}px ${spacing.md}px`,
                  borderRadius: radius.md, textDecoration: 'none',
                  fontSize: fontSize.sm,
                  fontWeight: active ? font.weight.semibold : font.weight.regular,
                  color: active ? colors.text : colors.textMuted,
                  background: active ? 'rgba(42,125,225,0.12)' : 'transparent',
                  borderLeft: active ? `3px solid ${colors.blue}` : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: spacing.md, borderTop: `1px solid rgba(91,163,245,0.08)` }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: spacing.md,
            padding: `${spacing.sm + 2}px ${spacing.md}px`,
            borderRadius: radius.md, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: fontSize.sm, color: colors.textMuted,
            fontFamily: font.sans,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{
          padding: `${spacing.md}px ${spacing.xl}px`,
          borderBottom: `1px solid rgba(91,163,245,0.08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: colors.surface, position: 'sticky', top: 0, zIndex: 5,
        }}>
          <h1 style={{ fontSize: fontSize.lg, fontWeight: font.weight.bold, color: colors.text }}>
            {title || activeRoute?.label || 'ASTER'}
          </h1>
          <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
            Bonjour, {pro?.nom} 👋
          </span>
        </div>
        <div style={{ flex: 1, padding: spacing.xl }}>
          {children}
        </div>
      </main>
    </div>
  )
}
