// ─── Validation email ─────────────────────────────────
export const validerEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.trim())
}

// ─── Validation mot de passe ──────────────────────────
// Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
export const validerMotDePasse = (password) => {
  const erreurs = []

  if (password.length < 8)
    erreurs.push('Au moins 8 caractères')
  if (!/[A-Z]/.test(password))
    erreurs.push('Au moins 1 lettre majuscule')
  if (!/[0-9]/.test(password))
    erreurs.push('Au moins 1 chiffre')
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password))
    erreurs.push('Au moins 1 caractère spécial (!@#$...)')

  return erreurs // tableau vide = mot de passe valide
}

// ─── Validation couleur hex ───────────────────────────
export const validerCouleurHex = (couleur) => {
  return /^#[0-9A-Fa-f]{6}$/.test(couleur)
}

// ─── Validation champs requis ─────────────────────────
export const champRequis = (valeur, nom) => {
  if (!valeur || !valeur.toString().trim()) {
    return `Le champ "${nom}" est requis`
  }
  return null
}
