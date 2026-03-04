export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Pro
  DASHBOARD: '/dashboard',
  CLIENTS: '/dashboard/clients',
  SCANNER: '/dashboard/scanner',
  PROFIL: '/dashboard/profil',
  ABONNEMENT: '/dashboard/abonnement',
  ANNONCES: '/dashboard/annonces',

  // Client
  REJOINDRE: '/rejoindre/:slug',
  CARTE: '/carte/:serial',
}